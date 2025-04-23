"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"Roles",
			[
				{
					role: "Admin",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					role: "Guru",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					role: "Siswa",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("Roles", null, {});
	},
};

