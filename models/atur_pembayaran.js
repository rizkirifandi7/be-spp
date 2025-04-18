'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Atur_pembayaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Atur_pembayaran.init({
    id_jenis_pembayaran: DataTypes.INTEGER,
    id_unit: DataTypes.INTEGER,
    nama_pembayaran: DataTypes.STRING,
    tahun: DataTypes.STRING,
    status: DataTypes.ENUM('on', 'off'),
    deskripsi: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Atur_pembayaran',
  });
  return Atur_pembayaran;
};