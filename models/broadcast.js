'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Broadcast extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Broadcast.init({
    id_unit: DataTypes.INTEGER,
    id_siswa: DataTypes.INTEGER,
    deskripsi: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Broadcast',
  });
  return Broadcast;
};