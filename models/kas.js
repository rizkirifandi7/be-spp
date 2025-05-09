'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Kas.belongsTo(models.Akun, {
        foreignKey: 'id_akun',
        as: 'akun',
      });
    }
  }
  Kas.init({
    id_akun: DataTypes.INTEGER,
    deskripsi: DataTypes.TEXT,
    jumlah: DataTypes.INTEGER,
    tipe: DataTypes.ENUM('masuk', 'keluar'),
  }, {
    sequelize,
    modelName: 'Kas',
  });
  return Kas;
};