const { Jurusan, Unit } = require("../models");

const getAllData = async (req, res) => {
	try {
		const jurusan = await Jurusan.findAll({
			include: [
				{
					model: Unit,
					as: "unit",
					attributes: ["id", "nama_unit"],
				},
			],
		});
		return res.status(200).json({
			message: "Data ditemukan",
			data: jurusan,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const jurusan = await Jurusan.findOne({
			where: { id },
		});

		if (!jurusan) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: jurusan,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	try {
		const { nama_jurusan, deskripsi, id_unit, status } = req.body;

		if (!nama_jurusan || !deskripsi) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const jurusan = await Jurusan.create({
			nama_jurusan,
			deskripsi,
			id_unit,
			status,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: jurusan,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const { nama_jurusan, deskripsi, id_unit, status } = req.body;

		if (!nama_jurusan || !deskripsi) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const jurusan = await Jurusan.update(
			{
				nama_jurusan,
				deskripsi,
				id_unit,
				status,
			},
			{
				where: { id },
			}
		);

		if (!jurusan[0]) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data berhasil diupdate",
			data: jurusan,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const jurusan = await Jurusan.destroy({
			where: { id },
		});

		if (!jurusan) {
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
