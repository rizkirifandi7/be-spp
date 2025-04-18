'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ppdb_pembayaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ppdb_pembayaran.init({
    id_unit: DataTypes.INTEGER,
    tahun: DataTypes.STRING,
    jumlah_pembayaran: DataTypes.INTEGER,
    target_siswa: DataTypes.INTEGER,
    status: DataTypes.ENUM('on', 'off'),
  }, {
    sequelize,
    modelName: 'ppdb_pembayaran',
  });
  return ppdb_pembayaran;
};