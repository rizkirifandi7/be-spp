"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Jenis_Pembayaran extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Jenis_Pembayaran.hasMany(models.ItemTagihan, {
				foreignKey: "id_jenis_pembayaran",
				as: "item_tagihan",
			});

			Jenis_Pembayaran.hasMany(models.Tagihan, {
				foreignKey: "id_jenis_pembayaran",
				as: "tagihan",
			});
		}
	}
	Jenis_Pembayaran.init(
		{
			nama: {
				type: DataTypes.STRING,
			},
			deskripsi: {
				type: DataTypes.TEXT,
			},
		},
		{
			sequelize,
			modelName: "Jenis_Pembayaran",
		}
	);
	return Jenis_Pembayaran;
};

