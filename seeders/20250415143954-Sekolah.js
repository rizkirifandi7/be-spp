"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert("Sekolahs", [
			{
				nama_sekolah: "SMA Negeri 1 Test",
				alamat: "Jl. Pendidikan No. 123, Kota Test, Provinsi Test",
				telepon: "021-7654321",
				website: "https://sman1test.sch.id",
				gambar: "sman1test.jpg",
				pemilik: "Pemerintah Provinsi Test",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Sekolahs", null, {});
	},
};

