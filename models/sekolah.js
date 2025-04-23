"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Sekolah extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {}
	}
	Sekolah.init(
		{
			nama_sekolah: DataTypes.STRING,
			alamat: DataTypes.TEXT,
			telepon: DataTypes.STRING,
			email: DataTypes.STRING,
			website: DataTypes.STRING,
			gambar: DataTypes.STRING,
			pemilik: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "Sekolah",
		}
	);
	return Sekolah;
};

