const { Pembayaran, Akun } = require("../models");

const getAllData = async (req, res) => {
	try {
		const data = await Pembayaran.findAll({
			include: [
				{
					model: Akun,
					as: "siswa",
					attributes: ["id", "nama"],
				},
			],
		});
		res.status(200).json({
			status: true,
			message: "Berhasil mendapatkan semua data",
			data,
		});
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await Pembayaran.findOne({
			where: { id },
		});
		if (!data) {
			return res.status(404).json({
				status: false,
				message: "Data tidak ditemukan",
			});
		}
		res.status(200).json({
			status: true,
			message: "Berhasil mendapatkan data",
			data,
		});
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

const createData = async (req, res) => {
	try {
		const {
			id_siswa,
			id_jenis_pembayaran,
			tahun,
			bulan,
			jumlah,
			deskripsi,
			tanggal_pembayaran,
		} = req.body;

		const data = await Pembayaran.create({
			id_siswa,
			id_jenis_pembayaran,
			tahun,
			bulan,
			jumlah,
			deskripsi,
			tanggal_pembayaran,
		});
		res.status(201).json({
			status: true,
			message: "Berhasil menambahkan data",
			data,
		});
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const {
			id_siswa,
			id_jenis_pembayaran,
			tahun,
			bulan,
			jumlah,
			deskripsi,
			tanggal_pembayaran,
		} = req.body;
		const data = await Pembayaran.findOne({
			where: { id },
		});
		if (!data) {
			return res.status(404).json({
				status: false,
				message: "Data tidak ditemukan",
			});
		}
		await Pembayaran.update(
			{
				id_siswa,
				id_jenis_pembayaran,
				tahun,
				bulan,
				jumlah,
				deskripsi,
				tanggal_pembayaran,
			},
			{
				where: { id },
			}
		);
		res.status(200).json({
			status: true,
			message: "Berhasil mengupdate data",
			data: {
				id_siswa,
				id_jenis_pembayaran,
				tahun,
				bulan,
				jumlah,
				deskripsi,
				tanggal_pembayaran,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await Pembayaran.findOne({
			where: { id },
		});
		if (!data) {
			return res.status(404).json({
				status: false,
				message: "Data tidak ditemukan",
			});
		}
		await Pembayaran.destroy({
			where: { id },
		});
		res.status(200).json({
			status: true,
			message: "Berhasil menghapus data",
		});
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

module.exports = {
	getAllData,
	getDataById,
	createData,
	updateData,
	deleteData,
};
