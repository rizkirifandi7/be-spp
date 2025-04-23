const { Akun, Akun_siswa } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const { sequelize } = require("../models");

const Login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const akun = await Akun.findOne({
			where: { email },
		});

		if (!akun) {
			return res.status(404).json({ message: "Email tidak terdaftar" });
		}

		const isMatch = await bcrypt.compare(password, akun.password);

		if (!isMatch) {
			return res.status(401).json({ message: "Password salah" });
		}

		const token = jwt.sign({ id: akun.id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		return res.status(200).json({
			message: "Login berhasil",
			data: {
				id: akun.id,
				nama: akun.nama,
				email: akun.email,
				token,
			},
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const Register = async (req, res) => {
	try {
		const {
			id_role,
			nama,
			email,
			password,
			tgl_lahir,
			alamat,
			status,
			telepon,
		} = req.body;

		const gambar = req.file ? req.file.filename : null;

		if (
			!id_role ||
			!nama ||
			!email ||
			!password ||
			!tgl_lahir ||
			!alamat ||
			!status ||
			!telepon
		) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const akun = await Akun.create({
			id_sekolah: 1,
			id_role,
			nama,
			email,
			password: hashedPassword,
			tgl_lahir,
			alamat,
			gambar,
			status,
			telepon,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: akun,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const RegisterSiswa = async (req, res) => {
	const transaction = await sequelize.transaction();

	try {
		// Extract account data
		const {
			id_role,
			nama,
			email,
			password,
			tgl_lahir,
			alamat,
			status,
			telepon,
			id_kelas,
			id_jurusan,
			id_unit,
			nisn,
		} = req.body;

		const gambar = req.file ? req.file.filename : null;

		// Validation
		const requiredFields = [
			"id_role",
			"nama",
			"email",
			"password",
			"tgl_lahir",
			"alamat",
			"telepon",
			"id_kelas",
			"id_jurusan",
			"id_unit",
			"nisn",
			"status",
		];

		const missingFields = requiredFields.filter((field) => !req.body[field]);
		if (missingFields.length > 0) {
			await transaction.rollback();
			return res.status(400).json({
				message: "Semua field harus diisi",
				missingFields,
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			await transaction.rollback();
			return res.status(400).json({ message: "Format email tidak valid" });
		}

		// Check if email already exists
		const emailExists = await Akun.findOne({
			where: { email },
			transaction,
		});

		if (emailExists) {
			await transaction.rollback();
			return res.status(400).json({ message: "Email sudah terdaftar" });
		}

		// Check if NISN already exists
		const nisnExists = await Akun_siswa.findOne({
			where: { nisn },
			transaction,
		});

		if (nisnExists) {
			await transaction.rollback();
			return res.status(400).json({ message: "NISN sudah terdaftar" });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create main account
		const akun = await Akun.create(
			{
				id_sekolah: 1,
				id_role,
				nama,
				email,
				password: hashedPassword,
				tgl_lahir: new Date(tgl_lahir), // Ensure proper date format
				alamat,
				gambar,
				status,
				telepon,
			},
			{ transaction }
		);

		// Create student account
		const akun_siswa = await Akun_siswa.create(
			{
				id_akun: akun.id,
				id_kelas,
				id_jurusan,
				id_unit,
				nisn,
				id_pembayaran: null, // Set default or handle separately
			},
			{ transaction }
		);

		// Commit transaction if everything succeeds
		await transaction.commit();

		return res.status(201).json({
			message: "Registrasi siswa berhasil",
			data: {
				akun: {
					id: akun.id,
					nama: akun.nama,
					email: akun.email,
					role: akun.id_role,
					status: akun.status,
				},
				siswa: {
					nisn: akun_siswa.nisn,
					kelas: akun_siswa.id_kelas,
					jurusan: akun_siswa.id_jurusan,
					unit: akun_siswa.id_unit,
				},
			},
		});
	} catch (error) {
		// Rollback transaction on error
		await transaction.rollback();

		console.error("Error in RegisterSiswa:", error);

		return res.status(500).json({
			message: "Terjadi kesalahan saat registrasi siswa",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

module.exports = {
	Login,
	Register,
	RegisterSiswa,
};
