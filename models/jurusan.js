"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Jurusan extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// Belongs to Unit
			Jurusan.belongsTo(models.Unit, {
				foreignKey: "id_unit",
				as: "unit",
			});

			// Has many Akun_siswa
			Jurusan.hasMany(models.Akun_siswa, {
				foreignKey: "id_jurusan",
				as: "akun_siswa",
			});
		}
	}
	Jurusan.init(
		{
			id_unit: DataTypes.INTEGER,
			nama_jurusan: DataTypes.STRING,
			deskripsi: DataTypes.TEXT,
			status: DataTypes.ENUM("on", "off"),
		},
		{
			sequelize,
			modelName: "Jurusan",
		}
	);
	return Jurusan;
};

