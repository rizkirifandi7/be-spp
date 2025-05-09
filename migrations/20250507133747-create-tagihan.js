"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Tagihans", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			id_siswa: {
				type: Sequelize.INTEGER,
			},
			id_jenis_pembayaran: {
				type: Sequelize.INTEGER,
			},
			deskripsi: {
				type: Sequelize.TEXT,
			},
			nomor_tagihan: {
				type: Sequelize.STRING,
			},
			total_jumlah: {
				type: Sequelize.DECIMAL(12, 2),
			},
			status: {
				type: Sequelize.ENUM("pending", "paid", "partial", "cancelled"),
			},
			jumlah_bayar: {
				type: Sequelize.DECIMAL(12, 2),
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
		await queryInterface.dropTable("Tagihans");
	},
};

