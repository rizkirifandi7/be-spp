"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert("Kelas", [
			{
				id_unit: 1,
				nama_kelas: "1 - IPA",
				deskripsi: "Ilmu Pengetahuan Alam",
				status: "on",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id_unit: 1,
				nama_kelas: "1 - IPS",
				deskripsi: "Ilmu Pengtahuan Sosial",
				status: "on",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Kelas", null, {});
	},
};

