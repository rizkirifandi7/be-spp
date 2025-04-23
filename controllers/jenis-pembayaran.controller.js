const { Jenis_pembayaran } = require("../models");

const getAllData = async (req, res) => {
	try {
		const jenis_pembayaran = await Jenis_pembayaran.findAll();
		if (jenis_pembayaran.length === 0) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}
		return res.status(200).json({
			message: "Data ditemukan",
			data: jenis_pembayaran,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const jenis_pembayaran = await Jenis_pembayaran.findOne({
			where: { id },
		});

		if (!jenis_pembayaran) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: jenis_pembayaran,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	try {
		const { tipe_pembayaran } = req.body;

		if (!tipe_pembayaran) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const jenis_pembayaran = await Jenis_pembayaran.create({
			tipe_pembayaran,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: jenis_pembayaran,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const { tipe_pembayaran } = req.body;

		if (!tipe_pembayaran) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const jenis_pembayaran = await Jenis_pembayaran.findOne({
			where: { id },
		});

		if (!jenis_pembayaran) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		await Jenis_pembayaran.update(
			{ tipe_pembayaran },
			{
				where: { id },
			}
		);

		return res.status(200).json({
			message: "Data berhasil diupdate",
			data: { id, tipe_pembayaran },
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const jenis_pembayaran = await Jenis_pembayaran.findOne({
			where: { id },
		});

		if (!jenis_pembayaran) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		await Jenis_pembayaran.destroy({
			where: { id },
		});

		return res.status(200).json({
			message: "Data berhasil dihapus",
			data: jenis_pembayaran,
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
