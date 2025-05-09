"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("ItemTagihans", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			id_tagihan: {
				type: Sequelize.INTEGER,
			},
			id_jenis_pembayaran: {
				type: Sequelize.INTEGER,
			},
			deskripsi: {
				type: Sequelize.TEXT,
			},
			jatuh_tempo: {
				type: Sequelize.DATE,
			},
			jumlah: {
				type: Sequelize.DECIMAL,
			},
			bulan: {
				type: Sequelize.STRING,
			},
			tahun: {
				type: Sequelize.STRING,
			},
			status: {
				type: Sequelize.ENUM("paid", "unpaid"),
			},
			midtrans_url: {
				type: Sequelize.TEXT,
			},
			midtrans_order_id: {
				type: Sequelize.TEXT,
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
		await queryInterface.dropTable("ItemTagihans");
	},
};

