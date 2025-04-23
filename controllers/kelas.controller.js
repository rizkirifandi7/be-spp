const { Kelas, Unit } = require("../models");

const getAllData = async (req, res) => {
	try {
		const kelas = await Kelas.findAll({
			include: {
				model: Unit,
				as: "unit",
				attributes: ["id", "nama_unit"],
			},
		});

		return res.status(200).json({
			message: "Data ditemukan",
			data: kelas,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const kelas = await Kelas.findOne({
			where: { id },
		});

		if (!kelas) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: kelas,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	try {
		const { nama_kelas, deskripsi, id_unit, status } = req.body;

		if (!nama_kelas || !deskripsi) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const kelas = await Kelas.create({
			nama_kelas,
			deskripsi,
			id_unit,
			status,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: kelas,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const { nama_kelas, deskripsi, id_unit, status } = req.body;

		if (!nama_kelas || !deskripsi) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const kelas = await Kelas.update(
			{
				nama_kelas,
				deskripsi,
				id_unit,
				status,
			},
			{
				where: { id },
			}
		);

		if (kelas[0] === 0) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data berhasil diupdate",
			data: kelas,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const kelas = await Kelas.destroy({
			where: { id },
		});

		if (!kelas) {
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
