const { Akun, Akun_siswa, Kelas, Jurusan, Unit } = require("../models");
const fs = require("fs");
const path = require("path");
const { sequelize } = require("../models");
const bcrypt = require("bcrypt"); // Add bcrypt import at the top

const getAllData = async (req, res) => {
	try {
		const akun = await Akun.findAll();
		return res.status(200).json({
			message: "Data ditemukan",
			data: akun,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getAllDataSiswa = async (req, res) => {
	try {
		// Get all accounts with siswa role and include necessary relations
		const siswaAccounts = await Akun.findAll({
			where: { role: "siswa" },
			include: [
				{
					model: Akun_siswa,
					as: "akun_siswa",
					attributes: [
						"id",
						"nisn",
						"nik",
						"tempat_lahir",
						"umur",
						"gambar",
						"tgl_lahir",
						"jenis_kelamin",
						"disabilitas",
						"kebutuhan_khusus",
						"no_kip",
						"nama_ayah",
						"nama_ibu",
						"nama_wali",
					],
					include: [
						{ model: Kelas, as: "kelas", attributes: ["id", "nama_kelas"] },
						{
							model: Jurusan,
							as: "jurusan",
							attributes: ["id", "nama_jurusan"],
						},
						{ model: Unit, as: "unit", attributes: ["id", "nama_unit"] },
					],
				},
			],
		});

		return res.status(200).json({
			message: "Data siswa ditemukan",
			data: siswaAccounts,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const akun = await Akun.findOne({
			where: { id },
		});

		if (!akun) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: akun,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataByIdSiswa = async (req, res) => {
	try {
		const { id } = req.params;
		const siswa = await Akun.findOne({
			where: { id },
			include: [
				{
					model: Akun_siswa,
					as: "akun_siswa",
					attributes: [
						"id",
						"nisn",
						"nik",
						"tempat_lahir",
						"tgl_lahir",
						"umur",
						"gambar",
						"jenis_kelamin",
						"disabilitas",
						"kebutuhan_khusus",
						"no_kip",
						"nama_ayah",
						"nama_ibu",
						"nama_wali",
					],
					include: [
						{ model: Kelas, as: "kelas", attributes: ["id", "nama_kelas"] },
						{
							model: Jurusan,
							as: "jurusan",
							attributes: ["id", "nama_jurusan"],
						},
						{ model: Unit, as: "unit", attributes: ["id", "nama_unit"] },
					],
				},
			],
			attributes: { exclude: ["password"] },
		});

		if (!siswa) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data siswa ditemukan",
			data: siswa,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	try {
		const {
			id_sekolah,
			role,
			id_siswa,
			nama,
			email,
			password,
			tgl_lahir,
			alamat,
			status,
		} = req.body;

		const gambar = req.file ? req.file.filename : null;

		if (!id_sekolah || !role || !nama || !email || !password || !tgl_lahir) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const akun = await Akun.create({
			id_sekolah,
			role,
			id_siswa: id_siswa || 0,
			nama,
			email,
			password,
			tgl_lahir,
			alamat,
			status,
			gambar,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: akun,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const UpdateSiswa = async (req, res) => {
	const transaction = await sequelize.transaction();

	try {
		const { id } = req.params;
		const {
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
			role,
		} = req.body;

		const gambar = req.file ? req.file.filename : undefined;

		// Validasi input
		if (!id) {
			await transaction.rollback();
			return res.status(400).json({ message: "ID siswa harus disediakan" });
		}

		// Cek apakah siswa ada
		const siswa = await Akun.findOne({
			where: { id },
			include: [
				{
					model: Akun_siswa,
					as: "akun_siswa",
					include: [
						{
							model: Kelas,
							as: "kelas",
						},
						{
							model: Jurusan,
							as: "jurusan",
						},
						{
							model: Unit,
							as: "unit",
						},
					],
				},
			],
			transaction,
		});

		if (!siswa) {
			await transaction.rollback();
			return res.status(404).json({ message: "Siswa tidak ditemukan" });
		}

		// Data untuk update Akun
		const updateAkun = {
			nama: nama || siswa.nama,
			email: email || siswa.email,
			tgl_lahir: tgl_lahir ? new Date(tgl_lahir) : siswa.tgl_lahir,
			alamat: alamat || siswa.alamat,
			status: status || siswa.status,
			telepon: telepon || siswa.telepon,
			role: role || siswa.role,
		};

		// Jika ada password baru
		if (password) {
			updateAkun.password = await bcrypt.hash(password, 10);
		}

		// Jika ada gambar baru, hapus gambar lama
		if (gambar && siswa.gambar) {
			const oldImagePath = path.join(
				__dirname,
				"..",
				"public",
				"uploads",
				siswa.gambar
			);

			// Hapus gambar lama jika ada
			if (fs.existsSync(oldImagePath)) {
				fs.unlink(oldImagePath, (err) => {
					if (err) {
						console.error("Gagal menghapus gambar lama:", err);
					}
				});
			}
			updateAkun.gambar = gambar;
		}

		// Data untuk update Akun_siswa
		const updateAkunSiswa = {
			id_kelas: id_kelas || (siswa.akun_siswa && siswa.akun_siswa.id_kelas),
			id_jurusan:
				id_jurusan || (siswa.akun_siswa && siswa.akun_siswa.id_jurusan),
			id_unit: id_unit || (siswa.akun_siswa && siswa.akun_siswa.id_unit),
			nisn: nisn || (siswa.akun_siswa && siswa.akun_siswa.nisn),
		};

		// Validasi NISN unik jika diubah
		if (nisn && siswa.akun_siswa && nisn !== siswa.akun_siswa.nisn) {
			const nisnExists = await Akun_siswa.findOne({
				where: { nisn },
				transaction,
			});

			if (nisnExists) {
				await transaction.rollback();
				return res.status(400).json({ message: "NISN sudah terdaftar" });
			}
		}

		// Validasi email unik jika diubah
		if (email && email !== siswa.email) {
			const emailExists = await Akun.findOne({
				where: { email },
				transaction,
			});

			if (emailExists) {
				await transaction.rollback();
				return res.status(400).json({ message: "Email sudah terdaftar" });
			}
		}

		// Update data Akun
		await Akun.update(updateAkun, {
			where: { id },
			transaction,
		});

		// Update data Akun_siswa jika ada
		if (siswa.akun_siswa) {
			await Akun_siswa.update(updateAkunSiswa, {
				where: { id_akun: id },
				transaction,
			});
		}

		// Commit transaksi
		await transaction.commit();

		// Ambil data terbaru untuk response
		const updatedSiswa = await Akun.findOne({
			where: { id },
			include: [
				{
					model: Akun_siswa,
					as: "akun_siswa",
					include: [
						{
							model: Kelas,
							as: "kelas",
						},
						{
							model: Jurusan,
							as: "jurusan",
						},
						{
							model: Unit,
							as: "unit",
						},
					],
				},
			],
			attributes: { exclude: ["password"] },
		});

		// Format response sesuai contoh
		return res.status(200).json({
			message: "Data siswa berhasil diperbarui",
			data: {
				id: updatedSiswa.id,
				id_sekolah: updatedSiswa.id_sekolah,
				role: updatedSiswa.role,
				nama: updatedSiswa.nama,
				email: updatedSiswa.email,
				telepon: updatedSiswa.telepon,
				tgl_lahir: updatedSiswa.tgl_lahir,
				alamat: updatedSiswa.alamat,
				status: updatedSiswa.status,
				gambar: updatedSiswa.gambar,
				createdAt: updatedSiswa.createdAt,
				updatedAt: updatedSiswa.updatedAt,
				akun_siswa: {
					id: updatedSiswa.akun_siswa.id,
					nisn: updatedSiswa.akun_siswa.nisn,
					kelas: {
						id: updatedSiswa.akun_siswa.kelas.id,
						nama_kelas: updatedSiswa.akun_siswa.kelas.nama_kelas,
					},
					jurusan: {
						id: updatedSiswa.akun_siswa.jurusan.id,
						nama_jurusan: updatedSiswa.akun_siswa.jurusan.nama_jurusan,
					},
					unit: {
						id: updatedSiswa.akun_siswa.unit.id,
						nama_unit: updatedSiswa.akun_siswa.unit.nama_unit,
					},
				},
			},
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Error in UpdateSiswa:", error);

		// Hapus gambar baru yang sudah diupload jika terjadi error
		if (req.file) {
			const newImagePath = path.join(
				__dirname,
				"..",
				"public",
				"uploads",
				req.file.filename
			);
			if (fs.existsSync(newImagePath)) {
				fs.unlinkSync(newImagePath);
			}
		}

		return res.status(500).json({
			message: "Terjadi kesalahan saat memperbarui data siswa",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const {
			role,
			id_siswa,
			nama,
			email,
			password,
			telepon,
			tgl_lahir,
			alamat,
			status,
		} = req.body;

		// Cari data akun yang akan diupdate untuk mendapatkan gambar lama
		const existingAccount = await Akun.findByPk(id);

		if (!existingAccount) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		// Cek apakah ada file gambar baru yang diupload
		let gambar = existingAccount.gambar; // Default ke gambar yang sudah ada

		if (req.file) {
			// Jika ada file baru, update dengan filename baru
			gambar = req.file.filename;

			// Hapus file gambar lama jika ada
			if (existingAccount.gambar) {
				const oldImagePath = path.join(
					__dirname,
					"..",
					"public",
					"uploads",
					existingAccount.gambar
				);

				if (fs.existsSync(oldImagePath)) {
					fs.unlinkSync(oldImagePath);
				}
			}
		}

		// Persiapkan data untuk update
		const updateData = {
			role,
			id_siswa: id_siswa || 0,
			nama,
			email,
			tgl_lahir,
			alamat,
			status,
			gambar,
			telepon,
		};

		// Hash password jika ada password baru
		if (password) {
			updateData.password = await bcrypt.hash(password, 10);
		}

		const [updatedRowCount, updatedRows] = await Akun.update(updateData, {
			where: { id },
			returning: true, // Untuk mendapatkan data yang sudah diupdate
		});

		if (updatedRowCount === 0) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		// Ambil data yang sudah diupdate
		const updatedAccount = await Akun.findByPk(id);

		return res.status(200).json({
			message: "Data berhasil diupdate",
			data: updatedAccount,
		});
	} catch (error) {
		// Hapus gambar baru yang sudah diupload jika terjadi error
		if (req.file) {
			const newImagePath = path.join(
				__dirname,
				"..",
				"public",
				"uploads",
				req.file.filename
			);
			if (fs.existsSync(newImagePath)) {
				fs.unlinkSync(newImagePath);
			}
		}

		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const akun = await Akun.destroy({
			where: { id },
		});

		if (!akun) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data berhasil dihapus",
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getAllData,
	getAllDataSiswa,
	getDataById,
	getDataByIdSiswa,
	createData,
	updateData,
	UpdateSiswa,
	deleteData,
};
