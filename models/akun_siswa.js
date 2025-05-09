"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Akun_siswa extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// Belongs to Akun (one-to-one)
			Akun_siswa.belongsTo(models.Akun, {
				foreignKey: "id_akun",
				as: "akun",
			});

			// Belongs to Kelas (many-to-one)
			Akun_siswa.belongsTo(models.Kelas, {
				foreignKey: "id_kelas",
				as: "kelas",
			});

			// Belongs to Jurusan (many-to-one)
			Akun_siswa.belongsTo(models.Jurusan, {
				foreignKey: "id_jurusan",
				as: "jurusan",
			});

			// Belongs to Unit (many-to-one)
			Akun_siswa.belongsTo(models.Unit, {
				foreignKey: "id_unit",
				as: "unit",
			});
		}
	}
	Akun_siswa.init(
		{
			id_akun: {
				type: DataTypes.INTEGER,
			},
			id_kelas: {
				type: DataTypes.INTEGER,
			},
			id_jurusan: {
				type: DataTypes.INTEGER,
			},
			id_unit: {
				type: DataTypes.INTEGER,
			},
			nisn: {
				type: DataTypes.STRING,
			},
			nik: {
				type: DataTypes.STRING,
			},
			tempat_lahir: {
				type: DataTypes.STRING,
			},
			tgl_lahir: {
				type: DataTypes.DATE,
			},
			gambar: {
				type: DataTypes.STRING,
			},
			umur: {
				type: DataTypes.STRING,
			},
			jenis_kelamin: {
				type: DataTypes.ENUM("Laki-Laki", "Perempuan"),
			},
			kebutuhan_khusus: {
				type: DataTypes.ENUM("Ada", "Tidak Ada"),
			},
			disabilitas: {
				type: DataTypes.ENUM("Ada", "Tidak Ada"),
			},
			no_kip: {
				type: DataTypes.STRING,
			},
			nama_ayah: {
				type: DataTypes.STRING,
			},
			nama_ibu: {
				type: DataTypes.STRING,
			},
			nama_wali: {
				type: DataTypes.STRING,
			},
		},
		{
			sequelize,
			modelName: "Akun_siswa",
		}
	);
	return Akun_siswa;
};

