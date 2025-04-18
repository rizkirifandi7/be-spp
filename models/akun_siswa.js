'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Akun_siswa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Akun_siswa.init({
    id_pembayaran: DataTypes.INTEGER,
    id_akun: DataTypes.INTEGER,
    id_kelas: DataTypes.INTEGER,
    id_jurusan: DataTypes.INTEGER,
    id_unit: DataTypes.INTEGER,
    nisn: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Akun_siswa',
  });
  return Akun_siswa;
};