const { Akun, Akun_siswa } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const { sequelize } = require("../models");

const Login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await Akun.findOne({
			where: { email },
		});

		if (!user) {
			return res.status(404).json({
				message: "User tidak ditemukan",
			});
		}

		const isMatch = bcrypt.compareSync(password, user.password);

		if (!isMatch) {
			return res.status(400).json({
				message: "Password salah",
			});
		}

		const token = jwt.sign(
			{ id: user.id, nama: user.nama, email: user.email, role: user.role },
			process.env.JWT_SECRET,
			{
				expiresIn: "6h",
			}
		);

		res.status(200).json({
			status: true,
			message: "Login berhasil",
			data: { token },
			role: user.role,
		});
	} catch (error) {
		res.status(500).json({
			message: error.message,
			status: false,
		});
	}
};

const Register = async (req, res) => {
	try {
		const { role, nama, email, password, alamat, status, telepon } = req.body;

		const gambar = req.file ? req.file.filename : null;

		if (
			!role ||
			!nama ||
			!email ||
			!password ||
			!alamat ||
			!status ||
			!telepon
		) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const akun = await Akun.create({
			id_sekolah: 1,
			role,
			nama,
			email,
			password: hashedPassword,
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
			role,
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
			nik,
			tempat_lahir,
			jenis_kelamin,
			kebutuhan_khusus,
			disabilitas,
			no_kip,
			nama_ayah,
			nama_ibu,
			nama_wali,
		} = req.body;

		const gambar = req.file ? req.file.filename : null;

		// Remove umur from required fields since it will be calculated
		const requiredFields = [
			"role",
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
			"nik",
			"tempat_lahir",
			"jenis_kelamin",
			"kebutuhan_khusus",
			"disabilitas",
			"no_kip",
			"nama_ayah",
			"nama_ibu",
			"nama_wali",
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

		// Calculate age based on birth date
		const birthDate = new Date(tgl_lahir);
		const today = new Date();

		let yearDiff = today.getFullYear() - birthDate.getFullYear();
		let monthDiff = today.getMonth() - birthDate.getMonth();

		// Adjust year and month difference if current month is before birth month
		// or if it's the same month but current day is before birth day
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			yearDiff--;
			monthDiff += 12;
		}

		// Adjust month difference if needed
		if (monthDiff < 0) {
			monthDiff += 12;
		}

		// Format the age as "X tahun, Y bulan"
		const umur = `${yearDiff} tahun, ${monthDiff} bulan`;

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create main account
		const akun = await Akun.create(
			{
				id_sekolah: 1,
				role,
				nama,
				email,
				password: hashedPassword,
				alamat,
				status,
				telepon,
			},
			{ transaction }
		);

		// Create student account with calculated age
		const akun_siswa = await Akun_siswa.create(
			{
				gambar,
				id_akun: akun.id,
				tgl_lahir: birthDate, // Ensure proper date format
				id_kelas,
				id_jurusan,
				id_unit,
				nisn,
				nik,
				tempat_lahir,
				umur, // Use the calculated age
				jenis_kelamin,
				kebutuhan_khusus,
				disabilitas,
				no_kip,
				nama_ayah,
				nama_ibu,
				nama_wali,
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
					role: akun.role,
					status: akun.status,
				},
				siswa: {
					nisn: akun_siswa.nisn,
					kelas: akun_siswa.id_kelas,
					jurusan: akun_siswa.id_jurusan,
					unit: akun_siswa.id_unit,
					nik: akun_siswa.nik,
					tempat_lahir: akun_siswa.tempat_lahir,
					umur: akun_siswa.umur,
					jenis_kelamin: akun_siswa.jenis_kelamin,
					kebutuhan_khusus: akun_siswa.kebutuhan_khusus,
					disabilitas: akun_siswa.disabilitas,
					no_kip: akun_siswa.no_kip,
					nama_ayah: akun_siswa.nama_ayah,
					nama_ibu: akun_siswa.nama_ibu,
					nama_wali: akun_siswa.nama_wali,
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
