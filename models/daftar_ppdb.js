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
			daftar_ppdb.belongsTo(models.ppdb_pembayaran, {
				foreignKey: "id_ppdb",
				as: "ppdb_pembayaran",
			});
		}
	}
	daftar_ppdb.init(
		{
			id_ppdb: {
				type: DataTypes.INTEGER,
			},
			id_unit: {
				type: DataTypes.INTEGER,
			},
			no_daftar: {
				type: DataTypes.STRING,
			},
			nama: {
				type: DataTypes.STRING,
			},
			email: {
				type: DataTypes.STRING,
			},
			status: {
				type: DataTypes.ENUM(
					"registered",
					"pending",
					"rejected",
					"accepted",
					"verification"
				),
			},
			alamat: {
				type: DataTypes.TEXT,
			},
			telepon: {
				type: DataTypes.STRING,
			},
			nik: {
				type: DataTypes.STRING,
			},
			tgl_lahir: {
				type: DataTypes.STRING,
			},
			status_pembayaran: {
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
			modelName: "daftar_ppdb",
		}
	);
	return daftar_ppdb;
};

