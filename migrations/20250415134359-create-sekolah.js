"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Sekolahs", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			nama_sekolah: {
				type: Sequelize.STRING,
			},
			alamat: {
				type: Sequelize.STRING,
			},
			telepon: {
				type: Sequelize.STRING,
			},
			email: {
				type: Sequelize.STRING,
			},
			pemilik: {
				type: Sequelize.STRING,
			},
			website: {
				type: Sequelize.STRING,
			},
			gambar: {
				type: Sequelize.STRING,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Sekolahs");
	},
};

