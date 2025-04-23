const { Kas } = require("../models");

const getAllData = async (req, res) => {
	try {
		const kas = await Kas.findAll();
		return res.status(200).json({
			message: "Data ditemukan",
			data: kas,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const kas = await Kas.findOne({
			where: { id },
		});

		if (!kas) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: kas,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	try {
		const { id_akun, deskripsi, jumlah, tipe } = req.body;

		if (!deskripsi || !jumlah || !tipe) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const kas = await Kas.create({
			id_akun,
			deskripsi,
			jumlah,
			tipe,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: kas,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const { id_akun, deskripsi, jumlah, tipe } = req.body;

		if (!deskripsi || !jumlah || !tipe) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const kas = await Kas.update(
			{ id_akun, deskripsi, jumlah, tipe },
			{ where: { id } }
		);

		if (kas[0] === 0) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data berhasil diperbarui",
			data: kas,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const kas = await Kas.destroy({
			where: { id },
		});

		if (!kas) {
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
	getDataById,
	createData,
	updateData,
	deleteData,
};
