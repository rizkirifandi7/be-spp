"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Pembayaran extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Pembayaran.belongsTo(models.Akun, {
				foreignKey: "id_siswa",
				as: "siswa",
			});

			Pembayaran.belongsTo(models.Tagihan, {
				foreignKey: "id_invoice",
				as: "tagihan",
			});
		}
	}
	Pembayaran.init(
		{
			id_invoice: {
				type: DataTypes.INTEGER,
			},
			id_siswa: {
				type: DataTypes.INTEGER,
			},
			jumlah: {
				type: DataTypes.DECIMAL,
			},
			metode_pembayaran: {
				type: DataTypes.STRING,
			},
			catatan: {
				type: DataTypes.TEXT,
			},
			sudah_verifikasi: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			sequelize,
			modelName: "Pembayaran",
		}
	);
	return Pembayaran;
};

