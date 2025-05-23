const { Akun, Akun_siswa, Kelas, Jurusan, Unit } = require("../models");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../middlewares/cloudinary");
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
	let tempFilePath = null; // To store req.file.path for cleanup

	try {
		const { id } = req.params;
		const {
			nama,
			email,
			password,
			// tgl_lahir for Akun_siswa will be handled specifically
			alamat,
			status,
			telepon,
			id_kelas,
			id_jurusan,
			id_unit,
			nisn,
			role,
			// Student specific fields for Akun_siswa
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

		// tgl_lahir from body, specifically for Akun_siswa
		const siswa_tgl_lahir = req.body.tgl_lahir;

		if (!id) {
			await transaction.rollback();
			return res.status(400).json({ message: "ID siswa harus disediakan" });
		}

		const akun = await Akun.findOne({
			where: { id },
			include: [
				{
					model: Akun_siswa,
					as: "akun_siswa",
				},
			],
			transaction,
		});

		if (!akun) {
			await transaction.rollback();
			return res.status(404).json({ message: "Siswa tidak ditemukan" });
		}

		// Data for update Akun model
		const updateAkunData = {
			nama: nama || akun.nama,
			email: email || akun.email,
			alamat: alamat || akun.alamat,
			status: status || akun.status,
			telepon: telepon || akun.telepon,
			role: role || akun.role,
			// If Akun model itself has a tgl_lahir distinct from Akun_siswa.tgl_lahir
			// tgl_lahir: req.body.akun_tgl_lahir ? new Date(req.body.akun_tgl_lahir) : akun.tgl_lahir,
		};

		if (password) {
			updateAkunData.password = await bcrypt.hash(password, 10);
		}

		// Data for update Akun_siswa model
		const updateAkunSiswaData = {
			id_kelas:
				id_kelas !== undefined
					? id_kelas
					: akun.akun_siswa
					? akun.akun_siswa.id_kelas
					: undefined,
			id_jurusan:
				id_jurusan !== undefined
					? id_jurusan
					: akun.akun_siswa
					? akun.akun_siswa.id_jurusan
					: undefined,
			id_unit:
				id_unit !== undefined
					? id_unit
					: akun.akun_siswa
					? akun.akun_siswa.id_unit
					: undefined,
			nisn:
				nisn !== undefined
					? nisn
					: akun.akun_siswa
					? akun.akun_siswa.nisn
					: undefined,
			nik:
				nik !== undefined
					? nik
					: akun.akun_siswa
					? akun.akun_siswa.nik
					: undefined,
			tempat_lahir:
				tempat_lahir !== undefined
					? tempat_lahir
					: akun.akun_siswa
					? akun.akun_siswa.tempat_lahir
					: undefined,
			jenis_kelamin:
				jenis_kelamin !== undefined
					? jenis_kelamin
					: akun.akun_siswa
					? akun.akun_siswa.jenis_kelamin
					: undefined,
			kebutuhan_khusus:
				kebutuhan_khusus !== undefined
					? kebutuhan_khusus
					: akun.akun_siswa
					? akun.akun_siswa.kebutuhan_khusus
					: undefined,
			disabilitas:
				disabilitas !== undefined
					? disabilitas
					: akun.akun_siswa
					? akun.akun_siswa.disabilitas
					: undefined,
			no_kip:
				no_kip !== undefined
					? no_kip
					: akun.akun_siswa
					? akun.akun_siswa.no_kip
					: undefined,
			nama_ayah:
				nama_ayah !== undefined
					? nama_ayah
					: akun.akun_siswa
					? akun.akun_siswa.nama_ayah
					: undefined,
			nama_ibu:
				nama_ibu !== undefined
					? nama_ibu
					: akun.akun_siswa
					? akun.akun_siswa.nama_ibu
					: undefined,
			nama_wali:
				nama_wali !== undefined
					? nama_wali
					: akun.akun_siswa
					? akun.akun_siswa.nama_wali
					: undefined,
		};

		if (siswa_tgl_lahir) {
			const birthDate = new Date(siswa_tgl_lahir);
			updateAkunSiswaData.tgl_lahir = birthDate;

			const today = new Date();
			let yearDiff = today.getFullYear() - birthDate.getFullYear();
			let monthDiff = today.getMonth() - birthDate.getMonth();
			if (
				monthDiff < 0 ||
				(monthDiff === 0 && today.getDate() < birthDate.getDate())
			) {
				yearDiff--;
				monthDiff = monthDiff + 12;
			}
			if (monthDiff < 0) {
				monthDiff += 12;
			}
			updateAkunSiswaData.umur = `${yearDiff} tahun, ${monthDiff} bulan`;
		}

		// Handle image update for Akun_siswa
		if (req.file) {
			tempFilePath = req.file.path;
			try {
				const result = await cloudinary.uploader.upload(tempFilePath, {
					folder: "akun_siswa_gambar",
				});
				updateAkunSiswaData.gambar = result.secure_url; // New image URL for Akun_siswa

				if (akun.akun_siswa && akun.akun_siswa.gambar) {
					try {
						const oldImageUrl = akun.akun_siswa.gambar;
						const uploadIndex = oldImageUrl.indexOf("/upload/");
						if (uploadIndex !== -1) {
							const pathAfterUpload = oldImageUrl.substring(
								uploadIndex + "/upload/".length
							);
							const parts = pathAfterUpload.split("/");
							let publicIdPath;
							if (parts.length > 1 && parts[0].match(/^v\d+$/)) {
								publicIdPath = parts.slice(1).join("/");
							} else {
								publicIdPath = parts.join("/");
							}
							const oldPublicId = publicIdPath.substring(
								0,
								publicIdPath.lastIndexOf(".")
							);
							if (oldPublicId) {
								await cloudinary.uploader.destroy(oldPublicId);
							}
						}
					} catch (deleteError) {
						console.error(
							"Gagal menghapus gambar lama dari Cloudinary:",
							deleteError.message
						);
					}
				}
				fs.unlinkSync(tempFilePath);
				tempFilePath = null;
			} catch (uploadError) {
				await transaction.rollback();
				if (tempFilePath && fs.existsSync(tempFilePath))
					fs.unlinkSync(tempFilePath);
				console.error("Cloudinary upload error:", uploadError);
				return res
					.status(500)
					.json({
						message: "Gagal mengunggah gambar ke Cloudinary.",
						error: uploadError.message,
					});
			}
		} else if (
			req.body.hapus_gambar === "true" &&
			akun.akun_siswa &&
			akun.akun_siswa.gambar
		) {
			try {
				const oldImageUrl = akun.akun_siswa.gambar;
				const uploadIndex = oldImageUrl.indexOf("/upload/");
				if (uploadIndex !== -1) {
					const pathAfterUpload = oldImageUrl.substring(
						uploadIndex + "/upload/".length
					);
					const parts = pathAfterUpload.split("/");
					let publicIdPath;
					if (parts.length > 1 && parts[0].match(/^v\d+$/)) {
						publicIdPath = parts.slice(1).join("/");
					} else {
						publicIdPath = parts.join("/");
					}
					const oldPublicId = publicIdPath.substring(
						0,
						publicIdPath.lastIndexOf(".")
					);
					if (oldPublicId) {
						await cloudinary.uploader.destroy(oldPublicId);
					}
					updateAkunSiswaData.gambar = null;
				}
			} catch (deleteError) {
				console.error(
					"Gagal menghapus gambar dari Cloudinary (explicit delete):",
					deleteError.message
				);
			}
		}

		if (nisn && akun.akun_siswa && nisn !== akun.akun_siswa.nisn) {
			const nisnExists = await Akun_siswa.findOne({
				where: { nisn, id_akun: { [Op.ne]: id } },
				transaction,
			});
			if (nisnExists) {
				await transaction.rollback();
				if (tempFilePath && fs.existsSync(tempFilePath))
					fs.unlinkSync(tempFilePath);
				return res
					.status(400)
					.json({ message: "NISN sudah terdaftar untuk siswa lain" });
			}
		}

		if (email && email !== akun.email) {
			const emailExists = await Akun.findOne({
				where: { email, id: { [Op.ne]: id } },
				transaction,
			});
			if (emailExists) {
				await transaction.rollback();
				if (tempFilePath && fs.existsSync(tempFilePath))
					fs.unlinkSync(tempFilePath);
				return res
					.status(400)
					.json({ message: "Email sudah terdaftar untuk akun lain" });
			}
		}

		await Akun.update(updateAkunData, { where: { id }, transaction });

		const finalUpdateAkunSiswaData = Object.fromEntries(
			Object.entries(updateAkunSiswaData).filter(([_, v]) => v !== undefined)
		);

		if (akun.akun_siswa && Object.keys(finalUpdateAkunSiswaData).length > 0) {
			await Akun_siswa.update(finalUpdateAkunSiswaData, {
				where: { id_akun: id },
				transaction,
			});
		} else if (
			!akun.akun_siswa &&
			Object.keys(finalUpdateAkunSiswaData).length > 0 &&
			akun.role === "siswa"
		) {
			// If Akun_siswa doesn't exist for a student, create it.
			finalUpdateAkunSiswaData.id_akun = id;
			await Akun_siswa.create(finalUpdateAkunSiswaData, { transaction });
		}

		await transaction.commit();

		const updatedSiswa = await Akun.findOne({
			where: { id },
			include: [
				{
					model: Akun_siswa,
					as: "akun_siswa",
					include: [
						{ model: Kelas, as: "kelas" },
						{ model: Jurusan, as: "jurusan" },
						{ model: Unit, as: "unit" },
					],
				},
			],
			attributes: { exclude: ["password"] },
		});

		const responseData = {
			id: updatedSiswa.id,
			id_sekolah: updatedSiswa.id_sekolah,
			role: updatedSiswa.role,
			nama: updatedSiswa.nama,
			email: updatedSiswa.email,
			telepon: updatedSiswa.telepon,
			alamat: updatedSiswa.alamat,
			status: updatedSiswa.status,
			// gambar: updatedSiswa.gambar, // This would be from Akun model if it has one
			createdAt: updatedSiswa.createdAt,
			updatedAt: updatedSiswa.updatedAt,
			akun_siswa: null,
		};

		if (updatedSiswa.akun_siswa) {
			responseData.akun_siswa = {
				id: updatedSiswa.akun_siswa.id,
				nisn: updatedSiswa.akun_siswa.nisn,
				gambar: updatedSiswa.akun_siswa.gambar, // Image from Akun_siswa
				tgl_lahir: updatedSiswa.akun_siswa.tgl_lahir
					? new Date(updatedSiswa.akun_siswa.tgl_lahir)
							.toISOString()
							.split("T")[0]
					: null,
				umur: updatedSiswa.akun_siswa.umur,
				nik: updatedSiswa.akun_siswa.nik,
				tempat_lahir: updatedSiswa.akun_siswa.tempat_lahir,
				jenis_kelamin: updatedSiswa.akun_siswa.jenis_kelamin,
				kebutuhan_khusus: updatedSiswa.akun_siswa.kebutuhan_khusus,
				disabilitas: updatedSiswa.akun_siswa.disabilitas,
				no_kip: updatedSiswa.akun_siswa.no_kip,
				nama_ayah: updatedSiswa.akun_siswa.nama_ayah,
				nama_ibu: updatedSiswa.akun_siswa.nama_ibu,
				nama_wali: updatedSiswa.akun_siswa.nama_wali,
				kelas: updatedSiswa.akun_siswa.kelas
					? {
							id: updatedSiswa.akun_siswa.kelas.id,
							nama_kelas: updatedSiswa.akun_siswa.kelas.nama_kelas,
					  }
					: null,
				jurusan: updatedSiswa.akun_siswa.jurusan
					? {
							id: updatedSiswa.akun_siswa.jurusan.id,
							nama_jurusan: updatedSiswa.akun_siswa.jurusan.nama_jurusan,
					  }
					: null,
				unit: updatedSiswa.akun_siswa.unit
					? {
							id: updatedSiswa.akun_siswa.unit.id,
							nama_unit: updatedSiswa.akun_siswa.unit.nama_unit,
					  }
					: null,
			};
		}

		return res.status(200).json({
			message: "Data siswa berhasil diperbarui",
			data: responseData,
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Error in UpdateSiswa:", error.message);
		if (tempFilePath && fs.existsSync(tempFilePath)) {
			fs.unlinkSync(tempFilePath);
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
