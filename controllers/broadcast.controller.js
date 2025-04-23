const { Broadcast } = require("../models");

const getAllData = async (req, res) => {
	try {
		const broadcast = await Broadcast.findAll();
		if (broadcast.length === 0) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}
		return res.status(200).json({
			message: "Data ditemukan",
			data: broadcast,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const broadcast = await Broadcast.findOne({
			where: { id },
		});

		if (!broadcast) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: broadcast,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	try {
		const { id_unit, id_siswa, deskripsi } = req.body;

		if (!deskripsi || !id_unit || !id_siswa) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const broadcast = await Broadcast.create({
			id_unit,
			id_siswa,
			deskripsi,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: broadcast,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const { id_unit, id_siswa, deskripsi } = req.body;

		if (!id_unit || !id_siswa || !deskripsi) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const broadcast = await Broadcast.findOne({
			where: { id },
		});

		if (!broadcast) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		await Broadcast.update(
			{
				id_unit,
				id_siswa,
				deskripsi,
			},
			{
				where: { id },
			}
		);

		return res.status(200).json({
			message: "Data berhasil diupdate",
			data: {
				id,
				id_unit,
				id_siswa,
				deskripsi,
			},
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const broadcast = await Broadcast.findOne({
			where: { id },
		});

		if (!broadcast) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		await Broadcast.destroy({
			where: { id },
		});

		return res.status(200).json({
			message: "Data berhasil dihapus",
			data: broadcast,
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
