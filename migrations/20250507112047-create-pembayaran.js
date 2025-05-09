"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Pembayarans", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			id_invoice: {
				type: Sequelize.INTEGER,
			},
			id_siswa: {
				type: Sequelize.INTEGER,
			},
			jumlah: {
				type: Sequelize.DECIMAL,
			},
			metode_pembayaran: {
				type: Sequelize.STRING,
			},
			catatan: {
				type: Sequelize.TEXT,
			},
			sudah_verifikasi: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
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
		await queryInterface.dropTable("Pembayarans");
	},
};

