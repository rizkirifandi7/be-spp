const { Unit } = require("../models");

const getAllData = async (req, res) => {
	try {
		const unit = await Unit.findAll();
		return res.status(200).json({
			message: "Data ditemukan",
			data: unit,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const unit = await Unit.findOne({
			where: { id },
		});

		if (!unit) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: unit,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	try {
		const { nama_unit, deskripsi } = req.body;

		if (!nama_unit || !deskripsi) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const unit = await Unit.create({
			nama_unit,
			deskripsi,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: unit,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const { nama_unit, deskripsi } = req.body;

		if (!nama_unit || !deskripsi) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const unit = await Unit.update(
			{ nama_unit, deskripsi },
			{
				where: { id },
			}
		);

		if (unit[0] === 0) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data berhasil diupdate",
			data: unit,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const unit = await Unit.destroy({
			where: { id },
		});

		if (unit === 0) {
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
