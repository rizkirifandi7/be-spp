'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Buat_pembayaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Buat_pembayaran.init({
    id_atur_pembayaran: DataTypes.INTEGER,
    id_siswa: DataTypes.INTEGER,
    jumlah_pembayaran: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Buat_pembayaran',
  });
  return Buat_pembayaran;
};