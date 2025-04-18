const { Sekolah } = require("../models");

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
	try {
		const { nama_sekolah, alamat, telepon, email, website, pemilik } = req.body;
		const gambar = req.file ? req.file.filename : null;

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

		const sekolah = await Sekolah.create({
			nama_sekolah,
			alamat,
			telepon,
			email,
			website,
			gambar,
			pemilik,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: sekolah,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const { nama_sekolah, alamat, telepon, email, website, pemilik } = req.body;
		const gambar = req.file ? req.file.filename : null;

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

		const sekolah = await Sekolah.findOne({
			where: { id },
		});

		if (!sekolah) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		await Sekolah.update(
			{
				nama_sekolah,
				alamat,
				telepon,
				email,
				website,
				gambar,
				pemilik,
			},
			{
				where: { id },
			}
		);

		return res.status(200).json({
			message: "Data berhasil diupdate",
			data: {
				id,
				nama_sekolah,
				alamat,
				telepon,
				email,
				gambar,
				website,
				pemilik,
			},
		});
	} catch (error) {
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
