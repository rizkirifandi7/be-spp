const {Bulan} = require('../models');

const getAllData = async (req, res) => {
  try {
    const bulan = await Bulan.findAll();
    if (bulan.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
    return res.status(200).json({
      message: "Data ditemukan",
      data: bulan,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}