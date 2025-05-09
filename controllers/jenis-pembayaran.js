const { Jenis_Pembayaran } = require("../models");

const getAllData = async (req, res) => {
	try {
		const data = await Jenis_Pembayaran.findAll();
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
		const data = await Jenis_Pembayaran.findOne({
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
		const { nama, deskripsi } = req.body;
		const data = await Jenis_Pembayaran.create({
			nama,
			deskripsi,
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
		const { nama, deskripsi } = req.body;
		const data = await Jenis_Pembayaran.findOne({
			where: { id },
		});
		if (!data) {
			return res.status(404).json({
				status: false,
				message: "Data tidak ditemukan",
			});
		}
		await Jenis_Pembayaran.update(
			{ nama, deskripsi },
			{
				where: { id },
			}
		);
		res.status(200).json({
			status: true,
			message: "Berhasil mengupdate data",
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
		const data = await Jenis_Pembayaran.findOne({
			where: { id },
		});
		if (!data) {
			return res.status(404).json({
				status: false,
				message: "Data tidak ditemukan",
			});
		}
		await Jenis_Pembayaran.destroy({
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
