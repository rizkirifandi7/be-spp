'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Atur_pembayarans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_jenis_pembayaran: {
        type: Sequelize.INTEGER
      },
      id_unit: {
        type: Sequelize.INTEGER
      },
      nama_pembayaran: {
        type: Sequelize.STRING
      },
      tahun:{
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('on', 'off')
      },
      deskripsi: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Atur_pembayarans');
  }
};