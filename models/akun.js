"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Akun extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// Belongs to Role
			Akun.belongsTo(models.Role, {
				foreignKey: "id_role",
				as: "role",
			});

			// Has one Akun_siswa
			Akun.hasOne(models.Akun_siswa, {
				foreignKey: "id_akun",
				as: "akun_siswa",
			});

			// Belongs to Sekolah (if exists)
			Akun.belongsTo(models.Sekolah, {
				foreignKey: "id_sekolah",
				as: "sekolah",
			});
		}
	}
	Akun.init(
		{
			id_sekolah: DataTypes.INTEGER,
			id_role: DataTypes.INTEGER,
			nama: DataTypes.STRING,
			email: DataTypes.STRING,
			password: DataTypes.STRING,
			telepon: DataTypes.STRING,
			tgl_lahir: DataTypes.DATE,
			alamat: DataTypes.STRING,
			status: DataTypes.ENUM("on", "off"),
			gambar: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "Akun",
		}
	);
	return Akun;
};

