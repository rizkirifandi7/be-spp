'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kelas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Kelas.init({
    id_unit: DataTypes.INTEGER,
    nama_kelas: DataTypes.STRING,
    deskripsi: DataTypes.TEXT,
    status: DataTypes.ENUM('on', 'off'),
  }, {
    sequelize,
    modelName: 'Kelas',
  });
  return Kelas;
};