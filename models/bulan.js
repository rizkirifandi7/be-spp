'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bulan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Bulan.init({
    nama_bulan: DataTypes.STRING,
    status: DataTypes.ENUM('on', 'off'),
    nomor_bulan: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Bulan',
  });
  return Bulan;
};