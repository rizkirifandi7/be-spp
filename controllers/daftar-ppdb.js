const { daftar_ppdb, ppdb_pembayaran, Unit } = require("../models");
const generateRandomNoDaftar = require("../lib/randomNumber");
const midtransClient = require("midtrans-client");
const dotenv = require("dotenv");
dotenv.config();

let snap = new midtransClient.Snap({
	isProduction: false,
	serverKey: process.env.SERVER_KEY,
	clientKey: process.env.CLIENT_KEY,
});

const createSnap = async (req, res) => {
	try {
		const { id } = req.params;

		const ppdb_siswa = await daftar_ppdb.findOne({
			where: { id: id },
			include: {
				model: ppdb_pembayaran,
				as: "ppdb_pembayaran",
				attributes: ["jumlah_pembayaran"],
				include: {
					model: Unit,
					as: "unit",
					attributes: ["nama_unit"],
				},
			},
		});

		const parameter = {
			transaction_details: {
				order_id:
					"PPDB-" + ppdb_siswa.no_daftar + Math.floor(Date.now() / 1000),
				gross_amount: ppdb_siswa.ppdb_pembayaran.jumlah_pembayaran,
			},
			credit_card: {
				secure: true,
			},
			customer_details: {
				first_name: ppdb_siswa.nama,
				last_name: ppdb_siswa.nama,
				email: ppdb_siswa.email,
				phone: ppdb_siswa.telepon,
			},
			callbacks: {
				finish: "http://localhost:8010/daftar-ppdb/status-pembayaran/" + id,
			},
		};

		const transaction = await snap.createTransaction(parameter);
		res.status(200).json({
			token: transaction.token,
			redirect_url: transaction.redirect_url,
			message: "Berhasil membuat transaksi",
		});
	} catch (error) {
		console.error("Error creating transaction:", error);
		res.status(500).json({ error: "Failed to create transaction" });
	}
};

const updatePaymentStatus = async (req, res) => {
	try {
		const { id } = req.params;

		// Verify the ID exists before updating
		const daftar = await daftar_ppdb.findOne({ where: { id } });

		if (!daftar) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		await daftar_ppdb.update({ status_pembayaran: "paid" }, { where: { id } });

		return res.status(200).json({
			message: "Status pembayaran berhasil diupdate",
			data: { id, status_pembayaran: "paid" },
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getAllData = async (req, res) => {
	try {
		const daftar = await daftar_ppdb.findAll({
			include: {
				model: ppdb_pembayaran,
				as: "ppdb_pembayaran",
				attributes: ["jumlah_pembayaran"],
				include: {
					model: Unit,
					as: "unit",
					attributes: ["nama_unit"],
				},
			},
		});
		return res.status(200).json({
			message: "Data ditemukan",
			data: daftar,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const getDataById = async (req, res) => {
	try {
		const { id } = req.params;
		const daftar = await daftar_ppdb.findOne({
			where: { id },
		});

		if (!daftar) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data ditemukan",
			data: daftar,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const createData = async (req, res) => {
	try {
		const {
			id_ppdb, // Assumed to be the ID of the ppdb_pembayaran record
			nama,
			email,
			status,
			telepon,
			tgl_lahir,
			alamat,
			nik,
			no_daftar,
		} = req.body;

		// Validasi field wajib
		if (
			!id_ppdb ||
			!nama ||
			!email ||
			!status ||
			!telepon ||
			!tgl_lahir ||
			!alamat ||
			!nik
		) {
			return res
				.status(400)
				.json({
					message:
						"Semua field wajib harus diisi, termasuk id_ppdb untuk detail pembayaran.",
				});
		}

		// 1. Fetch ppdb_pembayaran details to get gross_amount
		const pembayaranInfo = await ppdb_pembayaran.findOne({
			where: { id: id_ppdb }, // Assuming id_ppdb from req.body is the PK of ppdb_pembayaran
			include: {
				model: Unit,
				as: "unit", // Ensure 'as' matches your model association
				attributes: ["nama_unit"],
			},
		});

		if (
			!pembayaranInfo ||
			typeof pembayaranInfo.jumlah_pembayaran === "undefined"
		) {
			return res
				.status(404)
				.json({
					message:
						"Detail pembayaran tidak ditemukan atau jumlah pembayaran tidak valid untuk id_ppdb yang diberikan.",
				});
		}
		const grossAmount = pembayaranInfo.jumlah_pembayaran;

		// 2. Generate random no_daftar jika tidak disediakan
		const generatedNoDaftar = no_daftar || generateRandomNoDaftar();

		// 3. Create the initial daftar_ppdb record
		let newDaftarPpdb;
		try {
			newDaftarPpdb = await daftar_ppdb.create({
				id_ppdb, // This is the foreign key to ppdb_pembayaran
				no_daftar: generatedNoDaftar,
				nama,
				email,
				status,
				telepon,
				tgl_lahir,
				alamat,
				nik,
				status_pembayaran: "unpaid",
				midtrans_url: null, // Placeholder
				midtrans_order_id: null, // Placeholder
			});
		} catch (dbError) {
			console.error("Error creating daftar_ppdb entry:", dbError);
			return res
				.status(500)
				.json({
					message: "Gagal menyimpan data pendaftaran.",
					error: dbError.message,
				});
		}

		if (!newDaftarPpdb || !newDaftarPpdb.id) {
			return res
				.status(500)
				.json({
					message: "Gagal membuat entri pendaftaran atau mendapatkan ID.",
				});
		}

		// 4. Prepare Midtrans transaction parameters
		const midtransOrderId = `PPDB-${generatedNoDaftar}-${Date.now()}`;
		const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:8010"; // Configure your app's base URL

		const parameter = {
			transaction_details: {
				order_id: midtransOrderId,
				gross_amount: parseFloat(grossAmount), // Ensure gross_amount is a number
			},
			credit_card: {
				secure: true,
			},
			customer_details: {
				first_name: nama,
				last_name: nama, // Or handle separately if last name is distinct
				email: email,
				phone: telepon,
			},
			callbacks: {
				finish: `${appBaseUrl}/daftar-ppdb/status-pembayaran/${newDaftarPpdb.id}`,
			},
			// Optional: Add item details for better display on Midtrans page
			item_details: [
				{
					id: `REG-${newDaftarPpdb.id}`, // Unique ID for the item
					price: parseFloat(grossAmount),
					quantity: 1,
					name: `Biaya Pendaftaran PPDB ${
						pembayaranInfo.unit ? pembayaranInfo.unit.nama_unit : ""
					}`.trim(),
				},
			],
		};

		// 5. Create Midtrans transaction
		let transaction;
		try {
			transaction = await snap.createTransaction(parameter);
		} catch (midtransError) {
			console.error("Error creating Midtrans transaction:", midtransError);
			// Consider if you need to clean up the newDaftarPpdb record here
			// await daftar_ppdb.destroy({ where: { id: newDaftarPpdb.id }});
			return res
				.status(500)
				.json({
					error: "Failed to create Midtrans transaction",
					details: midtransError.message,
				});
		}

		if (!transaction || !transaction.redirect_url) {
			console.error(
				"Midtrans transaction object or redirect_url missing",
				transaction
			);
			return res
				.status(500)
				.json({ error: "Gagal mendapatkan URL redirect dari Midtrans." });
		}

		// 6. Update the daftar_ppdb record with Midtrans details
		await newDaftarPpdb.update({
			midtrans_url: transaction.redirect_url,
			midtrans_order_id: midtransOrderId,
		});

		// 7. Return response
		// Fetch the updated record to include all fields, including associations if needed for response
		const finalData = await daftar_ppdb.findOne({
			where: { id: newDaftarPpdb.id },
			// include: [{ model: ppdb_pembayaran, as: 'ppdb_pembayaran' }] // Optional: include related data if needed in response
		});

		return res.status(201).json({
			message: "Data berhasil ditambahkan dan transaksi Midtrans dibuat.",
			data: finalData, // Send the fully updated record
		});
	} catch (error) {
		console.error("Error in createData:", error);
		// Ensure a generic error message for unexpected errors
		if (!res.headersSent) {
			return res
				.status(500)
				.json({
					message: "Terjadi kesalahan pada server.",
					error: error.message,
				});
		}
	}
};

const updateData = async (req, res) => {
	try {
		const { id } = req.params;
		const { id_ppdb, nama, email, status, telepon, tgl_lahir, alamat, nik } =
			req.body;

		if (
			!id_ppdb ||
			!nama ||
			!email ||
			!status ||
			!telepon ||
			!tgl_lahir ||
			!alamat ||
			!nik
		) {
			return res.status(400).json({ message: "Semua field harus diisi" });
		}

		const daftar = await daftar_ppdb.update(
			{
				id_ppdb,
				nama,
				email,
				status,
				telepon,
				tgl_lahir,
				alamat,
				nik,
				status_pembayaran: "unpaid",
			},
			{ where: { id } }
		);

		return res.status(200).json({
			message: "Data berhasil diupdate",
			data: daftar,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const deleteData = async (req, res) => {
	try {
		const { id } = req.params;
		const daftar = await daftar_ppdb.destroy({
			where: { id },
		});

		if (!daftar) {
			return res.status(404).json({ message: "Data tidak ditemukan" });
		}

		return res.status(200).json({
			message: "Data berhasil dihapus",
			data: daftar,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getAllData,
	getDataById,
	createData,
	updateData,
	deleteData,
	createSnap,
	updatePaymentStatus,
};
