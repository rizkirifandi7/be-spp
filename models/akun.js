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

			Akun.hasMany(models.Pembayaran, {
				foreignKey: "id_siswa",
				as: "pembayaran",
			});

			Akun.hasMany(models.Tagihan, {
				foreignKey: "id_siswa",
				as: "tagihan",
			});

			Akun.hasMany(models.Kas, {
				foreignKey: "id_akun",
				as: "kas",
			});
		}
	}
	Akun.init(
		{
			id_sekolah: {
				type: DataTypes.INTEGER,
			},
			nama: {
				type: DataTypes.STRING,
			},
			email: {
				type: DataTypes.STRING,
			},
			password: {
				type: DataTypes.STRING,
			},
			telepon: {
				type: DataTypes.STRING,
			},
			alamat: {
				type: DataTypes.STRING,
			},
			status: {
				type: DataTypes.ENUM("on", "off"),
			},
			role: {
				type: DataTypes.ENUM("admin", "siswa", "guru"),
			},
		},
		{
			sequelize,
			modelName: "Akun",
		}
	);
	return Akun;
};

