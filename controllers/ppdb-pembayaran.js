const { ppdb_pembayaran, Unit } = require("../models");

const getAllData = async (req, res) => {
	try {
		const pembayaran = await ppdb_pembayaran.findAll({
			include: {
				model: Unit,
				as: "unit",
				attributes: ["id", "nama_unit"],
			},
		});

		return res.status(200).json({
			message: "Data ditemukan",
			data: pembayaran,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const pembayaran = await ppdb_pembayaran.findOne({
			where: { id },
		});

		if (!pembayaran) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: pembayaran,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	try {
		const { id_unit, tahun_ajaran, jumlah_pembayaran, target_siswa, status } =
			req.body;

		if (
			!id_unit ||
			!tahun_ajaran ||
			!jumlah_pembayaran ||
			!target_siswa ||
			!status
		) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const pembayaran = await ppdb_pembayaran.create({
			id_unit,
			tahun_ajaran,
			jumlah_pembayaran,
			target_siswa,
			status,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: pembayaran,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const { id_unit, tahun_ajaran, jumlah_pembayaran, target_siswa, status } =
			req.body;

		if (
			!id_unit ||
			!tahun_ajaran ||
			!jumlah_pembayaran ||
			!target_siswa ||
			!status
		) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const pembayaran = await ppdb_pembayaran.update(
			{
				id_unit,
				tahun_ajaran,
				jumlah_pembayaran,
				target_siswa,
				status,
			},
			{ where: { id } }
		);

		if (pembayaran[0] === 0) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data berhasil diperbarui",
			data: pembayaran,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const pembayaran = await ppdb_pembayaran.destroy({
			where: { id },
		});

		if (pembayaran === 0) {
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
