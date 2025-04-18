'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pembayaran_bulanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Pembayaran_bulanan.init({
    id_pembayaran: DataTypes.INTEGER,
    id_bulan: DataTypes.INTEGER,
    jumlah: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Pembayaran_bulanan',
  });
  return Pembayaran_bulanan;
};