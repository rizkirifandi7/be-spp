const { daftar_ppdb, ppdb_pembayaran, Unit } = require("../models");
const generateRandomNoDaftar = require("../lib/randomNumber");

const getAllData = async (req, res) => {
	try {
		const daftar = await daftar_ppdb.findAll({
			include: {
				model: ppdb_pembayaran,
				as: "ppdb_pembayaran",
				attributes: ["jumlah_pembayaran"],
				include: {
					model: Unit,
					as: "unit",
					attributes: ["nama_unit"],
				},
			},
		});
		return res.status(200).json({
			message: "Data ditemukan",
			data: daftar,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const daftar = await daftar_ppdb.findOne({
			where: { id },
		});

		if (!daftar) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: daftar,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	try {
		const {
			id_ppdb,
			nama,
			email,
			status,
			telepon,
			tgl_lahir,
			alamat,
			nik,
			no_daftar, // Tidak lagi mandatory
		} = req.body;

		// Validasi field wajib (kecuali no_daftar)
		if (
			!id_ppdb ||
			!nama ||
			!email ||
			!status ||
			!telepon ||
			!tgl_lahir ||
			!alamat ||
			!nik
		) {
			return res.status(400).json({ message: "Semua field wajib harus diisi" });
		}

		// Generate random no_daftar jika tidak disediakan
		const generatedNoDaftar = no_daftar || generateRandomNoDaftar();

		const daftar = await daftar_ppdb.create({
			id_ppdb,
			no_daftar: generatedNoDaftar,
			nama,
			email,
			status,
			telepon,
			tgl_lahir,
			alamat,
			nik,
			status_pembayaran: "unpaid",
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: daftar,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const {
			id_ppdb,
			nama,
			email,
			status,
			telepon,
			tgl_lahir,
			alamat,
			nik,
		} = req.body;

		if (
			!id_ppdb ||
			!nama ||
			!email ||
			!status ||
			!telepon ||
			!tgl_lahir ||
			!alamat ||
			!nik
		) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const daftar = await daftar_ppdb.update(
			{
				id_ppdb,
				nama,
				email,
				status,
				telepon,
				tgl_lahir,
				alamat,
				nik,
				status_pembayaran: "unpaid",
			},
			{ where: { id } }
		);

		return res.status(200).json({
			message: "Data berhasil diupdate",
			data: daftar,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const daftar = await daftar_ppdb.destroy({
			where: { id },
		});

		if (!daftar) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data berhasil dihapus",
			data: daftar,
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
