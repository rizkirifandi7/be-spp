"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class daftar_ppdb extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	daftar_ppdb.init(
		{
			id_ppdb: DataTypes.INTEGER,
			id_unit: DataTypes.INTEGER,
			no_daftar: DataTypes.STRING,
			nama: DataTypes.STRING,
			email: DataTypes.STRING,
			status: DataTypes.ENUM(
				"registered",
				"pending",
				"rejected",
				"accepted",
				"verification"
			),
			telepon: DataTypes.STRING,
			tgl_lahir: DataTypes.DATE,
			alamat: DataTypes.STRING,
			nik: DataTypes.STRING,
			status_pembayaran: DataTypes.ENUM("paid", "unpaid"),
			gambar: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "daftar_ppdb",
		}
	);
	return daftar_ppdb;
};

