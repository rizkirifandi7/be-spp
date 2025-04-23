"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Unit extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Unit.hasMany(models.Kelas, {
				foreignKey: "id_unit",
				as: "kelas",
			});

			Unit.hasMany(models.ppdb_pembayaran, {
				foreignKey: "id_unit",
				as: "ppdb_pembayaran",
			});

			Unit.hasMany(models.Jurusan, {
				foreignKey: "id_unit",
				as: "jurusan",
			});
		}
	}
	Unit.init(
		{
			nama_unit: DataTypes.STRING,
			deskripsi: DataTypes.TEXT,
		},
		{
			sequelize,
			modelName: "Unit",
		}
	);
	return Unit;
};

