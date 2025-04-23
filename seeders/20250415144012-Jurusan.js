"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert("Jurusans", [
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
				deskripsi: "Ilmu Pengtahuan Sosial",
				status: "on",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Jurusans", null, {});
	},
};

