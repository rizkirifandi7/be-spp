const { Bulan } = require("../models");

const getAllData = async (req, res) => {
	try {
		const bulan = await Bulan.findAll();

		return res.status(200).json({
			message: "Data ditemukan",
			data: bulan,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const bulan = await Bulan.findOne({
			where: { id },
		});

		if (!bulan) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: bulan,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	try {
		const { nama_bulan, status, nomor_bulan } = req.body;

		if (!nama_bulan || !status || !nomor_bulan) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const bulan = await Bulan.create({
			nama_bulan,
			status,
			nomor_bulan,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: bulan,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const { nama_bulan, status, nomor_bulan } = req.body;

		if (!nama_bulan || !status || !nomor_bulan) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const bulan = await Bulan.update(
			{ nama_bulan, status, nomor_bulan },
			{ where: { id } }
		);

		if (bulan[0] === 0) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data berhasil diupdate",
			data: bulan,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const bulan = await Bulan.destroy({
			where: { id },
		});

		if (!bulan) {
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
