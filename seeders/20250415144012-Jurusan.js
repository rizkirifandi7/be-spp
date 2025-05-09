"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"Jurusans",
			[
				{
					id_unit: 1,
					nama_jurusan: "IPA",
					deskripsi: "Ilmu Pengetahuan Alam",
					status: "on",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id_unit: 1,
					nama_jurusan: "IPS",
					deskripsi: "Ilmu Pengetahuan Sosial",
					status: "on",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("Jurusans", null, {});
	},
};

