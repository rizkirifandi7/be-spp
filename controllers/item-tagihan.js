const { ItemTagihan } = require("../models");

const getAllData = async (req, res) => {
	try {
		const itemTagihan = await ItemTagihan.findAll();

		return res.status(200).json({
			message: "Data ditemukan",
			data: itemTagihan,
			status: true,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const itemTagihan = await ItemTagihan.findOne({
			where: { id },
		});

		if (!itemTagihan) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: itemTagihan,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getAllData,
	getDataById,
};
