"use strict";
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const salt = await bcrypt.genSalt(10);
		const hashedAdminPassword = await bcrypt.hash("admin123", salt);

		return queryInterface.bulkInsert("Akuns", [
			{
				id_sekolah: 1,
				nama: "Admin Utama",
				email: "admin@sekolah.com",
				password: hashedAdminPassword,
				telepon: "081234567890",
				tgl_lahir: new Date(1985, 5, 15),
				alamat: "Jl. Pendidikan No. 1, Jakarta",
				status: "on",
				gambar: "admin_default.jpg",
				role: "admin",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Akuns", null, {});
	},
};

