"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Akun_siswa extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// Belongs to Akun (one-to-one)
			Akun_siswa.belongsTo(models.Akun, {
				foreignKey: "id_akun",
				as: "akun",
			});

			// Belongs to Kelas (many-to-one)
			Akun_siswa.belongsTo(models.Kelas, {
				foreignKey: "id_kelas",
				as: "kelas",
			});

			// Belongs to Jurusan (many-to-one)
			Akun_siswa.belongsTo(models.Jurusan, {
				foreignKey: "id_jurusan",
				as: "jurusan",
			});

			// Belongs to Unit (many-to-one)
			Akun_siswa.belongsTo(models.Unit, {
				foreignKey: "id_unit",
				as: "unit",
			});

			// // Belongs to Pembayaran (assuming this exists)
			// Akun_siswa.belongsTo(models.Pembayaran, {
			// 	foreignKey: "id_pembayaran",
			// 	as: "pembayaran",
			// });
		}
	}
	Akun_siswa.init(
		{
			id_akun: DataTypes.INTEGER,
			id_pembayaran: DataTypes.INTEGER,
			id_kelas: DataTypes.INTEGER,
			id_jurusan: DataTypes.INTEGER,
			id_unit: DataTypes.INTEGER,
			nisn: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "Akun_siswa",
		}
	);
	return Akun_siswa;
};

