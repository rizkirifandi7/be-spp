"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("daftar_ppdbs", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			id_ppdb: {
				type: Sequelize.INTEGER,
			},
			id_unit: {
				type: Sequelize.INTEGER,
			},
			no_daftar: {
				type: Sequelize.STRING,
			},
			nama: {
				type: Sequelize.STRING,
			},
			email: {
				type: Sequelize.STRING,
			},
			status: {
				type: Sequelize.ENUM(
					"registered",
					"pending",
					"rejected",
					"accepted",
					"verification"
				),
			},
			alamat: {
				type: Sequelize.TEXT,
			},
			telepon: {
				type: Sequelize.STRING,
			},
			nik: {
				type: Sequelize.STRING,
			},
			tgl_lahir: {
				type: Sequelize.STRING,
			},
			status_pembayaran: {
				type: Sequelize.ENUM("paid", "unpaid"),
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
		await queryInterface.dropTable("daftar_ppdbs");
	},
};

