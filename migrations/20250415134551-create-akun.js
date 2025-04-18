'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Akuns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_sekolah: {
        type: Sequelize.INTEGER
      },
      id_role: {
        type: Sequelize.INTEGER
      },
      nama: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      telepon: {
        type: Sequelize.STRING
      },
      tgl_lahir: {
        type: Sequelize.DATE
      },
      alamat: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('on', 'off')
      },
      gambar: {
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
    await queryInterface.dropTable('Akuns');
  }
};