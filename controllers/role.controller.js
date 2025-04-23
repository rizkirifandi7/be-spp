const { Role } = require("../models");

const getAllData = async (req, res) => {
	try {
		const roles = await Role.findAll();
		return res.status(200).json({
			message: "Data ditemukan",
			data: roles,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const roles = await Role.findOne({
			where: { id },
		});

		if (!roles) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: roles,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	try {
		const { role } = req.body;

		if (!role) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const roles = await Role.create({
			role,
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan",
			data: roles,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const { role } = req.body;

		if (!role) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const roles = await Role.findOne({
			where: { id },
		});

		if (!roles) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		await Role.update(
			{ role },
			{
				where: { id },
			}
		);

		return res.status(200).json({
			message: "Data berhasil diupdate",
			data: { id, role },
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const roles = await Role.findOne({
			where: { id },
		});

		if (!roles) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		await Role.destroy({
			where: { id },
		});

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
