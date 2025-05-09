"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Tagihan extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Tagihan.belongsTo(models.Akun, {
				foreignKey: "id_siswa",
				as: "siswa",
			});

			Tagihan.hasMany(models.ItemTagihan, {
				foreignKey: "id_tagihan",
				as: "item_tagihan",
			});

			Tagihan.hasMany(models.Pembayaran, {
				foreignKey: "id_invoice",
				as: "pembayaran",
			});

			Tagihan.belongsTo(models.Jenis_Pembayaran, {
				foreignKey: "id_jenis_pembayaran",
				as: "jenis_pembayaran",
			});
		}
	}
	Tagihan.init(
		{
			id_siswa: {
				type: DataTypes.INTEGER,
			},
			id_jenis_pembayaran: {
				type: DataTypes.INTEGER,
			},
			deskripsi: {
				type: DataTypes.TEXT,
			},
			nomor_tagihan: {
				type: DataTypes.STRING,
			},
			total_jumlah: {
				type: DataTypes.DECIMAL(12, 2),
			},
			status: {
				type: DataTypes.ENUM("pending", "paid", "partial", "cancelled"),
			},
			jumlah_bayar: {
				type: DataTypes.DECIMAL(12, 2),
			},
		},
		{
			sequelize,
			modelName: "Tagihan",
		}
	);
	return Tagihan;
};

