'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jurusan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Jurusan.init({
    id_unit: DataTypes.INTEGER,
    nama_jurusan: DataTypes.STRING,
    deskripsi: DataTypes.TEXT,
    status: DataTypes.ENUM('on', 'off'),
  }, {
    sequelize,
    modelName: 'Jurusan',
  });
  return Jurusan;
};