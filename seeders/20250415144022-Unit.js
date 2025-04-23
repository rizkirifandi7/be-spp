"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert("Units", [
			{
				nama_unit: "SMA",
				deskripsi: "Sekolah Menengah Atas",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				nama_unit: "SMP",
				deskripsi: "Sekolah Menengah Pertama",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Units", null, {});
	},
};

