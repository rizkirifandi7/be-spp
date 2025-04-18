'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Akun_siswas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_pembayaran: {
        type: Sequelize.INTEGER
      },
      id_akun: {
        type: Sequelize.INTEGER
      },
      id_kelas: {
        type: Sequelize.INTEGER
      },
      id_jurusan: {
        type: Sequelize.INTEGER
      },
      id_unit: {
        type: Sequelize.INTEGER
      },
      nisn: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Akun_siswas');
  }
};