"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"Jenis_Pembayarans",
			[
				{
					nama: "Bulanan",
					deskripsi: "Pembayaran SPP Bulanana",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					nama: "Bebas",
					deskripsi: "Pembayaran SPP Bebas",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("Jenis_Pembayarans", null, {});
	},
};

