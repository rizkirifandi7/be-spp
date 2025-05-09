"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"Kelas",
			[
				{
					id_unit: 1,
					nama_kelas: "MA",
					deskripsi: "Madrasah Aliyah",
					status: "on",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("Kelas", null, {});
	},
};

