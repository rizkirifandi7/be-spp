"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class ItemTagihan extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			ItemTagihan.belongsTo(models.Tagihan, {
				foreignKey: "id_tagihan",
				as: "tagihan",
			});

			ItemTagihan.belongsTo(models.Jenis_Pembayaran, {
				foreignKey: "id_jenis_pembayaran",
				as: "jenis_pembayaran",
			});
		}
	}
	ItemTagihan.init(
		{
			id_tagihan: {
				type: DataTypes.INTEGER,
			},
			id_jenis_pembayaran: {
				type: DataTypes.INTEGER,
			},
			deskripsi: {
				type: DataTypes.TEXT,
			},
			jumlah: {
				type: DataTypes.DECIMAL,
			},
			jatuh_tempo: {
				type: DataTypes.DATE,
			},
			bulan: {
				type: DataTypes.STRING,
			},
			tahun: {
				type: DataTypes.STRING,
			},
			status: {
				type: DataTypes.ENUM("paid", "unpaid"),
			},
			midtrans_url: {
				type: DataTypes.TEXT,
			},
			midtrans_order_id: {
				type: DataTypes.TEXT,
			},
		},
		{
			sequelize,
			modelName: "ItemTagihan",
		}
	);
	return ItemTagihan;
};

