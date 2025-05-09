'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ppdb_pembayarans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_unit: {
        type: Sequelize.INTEGER
      },
      tahun_ajaran: {
        type: Sequelize.STRING
      },
      jumlah_pembayaran: {
        type: Sequelize.INTEGER
      },
      target_siswa: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM('on', 'off')
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
    await queryInterface.dropTable('ppdb_pembayarans');
  }
};