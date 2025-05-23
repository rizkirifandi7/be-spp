const { Sekolah } = require("../models");
const cloudinary = require("../middlewares/cloudinary"); // Import Cloudinary middleware
const fs = require("fs"); // Import Node.js File System module
const path = require("path"); // Import path module

const getAllData = async (req, res) => {
	try {
		const sekolah = await Sekolah.findAll();
		if (sekolah.length === 0) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}
		return res.status(200).json({
			message: "Data ditemukan",
			data: sekolah,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const sekolah = await Sekolah.findOne({
			where: { id },
		});

		if (!sekolah) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: sekolah,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	let tempFilePath;
	try {
		const { nama_sekolah, alamat, telepon, email, website, pemilik } = req.body;

		if (
			!nama_sekolah ||
			!alamat ||
			!telepon ||
			!email ||
			!website ||
			!pemilik
		) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		let gambarUrl = null;
		if (req.file) {
			tempFilePath = req.file.path;
			try {
				const result = await cloudinary.uploader.upload(tempFilePath, {
					folder: "sekolah_gambar", // Customize Cloudinary folder
				});
				gambarUrl = result.secure_url;
				fs.unlinkSync(tempFilePath); // Delete local file after successful upload
				tempFilePath = null;
			} catch (uploadError) {
				if (tempFilePath && fs.existsSync(tempFilePath)) {
					fs.unlinkSync(tempFilePath);
				}
				console.error("Cloudinary upload error:", uploadError);
				return res.status(500).json({
					message: "Gagal mengunggah gambar ke Cloudinary.",
					error: uploadError.message,
				});
			}
		}

		const sekolah = await Sekolah.create({
			nama_sekolah,
			alamat,
			telepon,
			email,
			website,
			gambar: gambarUrl, // Use Cloudinary URL
			pemilik,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: sekolah,
		});
	} catch (error) {
		if (tempFilePath && fs.existsSync(tempFilePath)) {
			fs.unlinkSync(tempFilePath); // Cleanup on general error if file was processed
		}
		return res.status(500).json({ message: error.message });
	}
};

const updateData = async (req, res) => {
	let tempFilePath;
	try {
		const { id } = req.params;
		const { nama_sekolah, alamat, telepon, email, website, pemilik } = req.body;

		// Fields to update, initially without gambar
		const updateFields = {
			nama_sekolah,
			alamat,
			telepon,
			email,
			website,
			pemilik,
		};

		// Validation for required text fields (gambar is optional or handled separately)
		if (
			!updateFields.nama_sekolah ||
			!updateFields.alamat ||
			!updateFields.telepon ||
			!updateFields.email ||
			!updateFields.website ||
			!updateFields.pemilik
		) {
			return res.status(400).json({ message: "Semua field teks harus diisi" });
		}

		const sekolah = await Sekolah.findOne({
			where: { id },
		});

		if (!sekolah) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		let newGambarUrl = sekolah.gambar; // Keep old image by default

		if (req.file) {
			tempFilePath = req.file.path;
			try {
				const result = await cloudinary.uploader.upload(tempFilePath, {
					folder: "sekolah_gambar",
				});
				newGambarUrl = result.secure_url; // New image URL

				// If there was an old image, delete it from Cloudinary
				if (sekolah.gambar) {
					try {
						const oldPublicId = sekolah.gambar.split("/").pop().split(".")[0];
						const fullPublicId = `sekolah_gambar/${oldPublicId}`; // Assuming folder structure
						await cloudinary.uploader.destroy(fullPublicId);
					} catch (deleteError) {
						console.error(
							"Gagal menghapus gambar lama dari Cloudinary:",
							deleteError.message
						);
						// Continue even if old image deletion fails, but log it
					}
				}
				fs.unlinkSync(tempFilePath); // Delete local file
				tempFilePath = null;
			} catch (uploadError) {
				if (tempFilePath && fs.existsSync(tempFilePath)) {
					fs.unlinkSync(tempFilePath);
				}
				console.error("Cloudinary upload error:", uploadError);
				return res.status(500).json({
					message: "Gagal mengunggah gambar baru ke Cloudinary.",
					error: uploadError.message,
				});
			}
		} else if (req.body.hapus_gambar === "true" && sekolah.gambar) {
			// If hapus_gambar is true and there's an existing image, delete it
			try {
				const oldPublicId = sekolah.gambar.split("/").pop().split(".")[0];
				const fullPublicId = `sekolah_gambar/${oldPublicId}`;
				await cloudinary.uploader.destroy(fullPublicId);
				newGambarUrl = null; // Set gambar to null
			} catch (deleteError) {
				console.error(
					"Gagal menghapus gambar dari Cloudinary (explicit delete):",
					deleteError.message
				);
				// Potentially return an error or just log, depending on desired behavior
			}
		}

		updateFields.gambar = newGambarUrl; // Set the new or existing/nulled gambar URL

		await Sekolah.update(updateFields, {
			where: { id },
		});

		// Fetch the updated data to return
		const updatedSekolah = await Sekolah.findOne({ where: { id } });

		return res.status(200).json({
			message: "Data berhasil diupdate",
			data: updatedSekolah,
		});
	} catch (error) {
		if (tempFilePath && fs.existsSync(tempFilePath)) {
			fs.unlinkSync(tempFilePath);
		}
		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const sekolah = await Sekolah.findOne({
			where: { id },
		});
		if (!sekolah) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		// If there's an image, delete it from Cloudinary before deleting the record
		if (sekolah.gambar) {
			try {
				const publicId = sekolah.gambar.split("/").pop().split(".")[0];
				const fullPublicId = `sekolah_gambar/${publicId}`; // Assuming folder structure
				await cloudinary.uploader.destroy(fullPublicId);
			} catch (deleteError) {
				console.error(
					"Gagal menghapus gambar dari Cloudinary saat menghapus data sekolah:",
					deleteError.message
				);
				// Log the error, but proceed with deleting the database record
			}
		}

		await Sekolah.destroy({
			where: { id },
		});
		return res.status(200).json({
			message: "Data berhasil dihapus",
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getAllData,
	getDataById,
	createData,
	updateData,
	deleteData,
};
