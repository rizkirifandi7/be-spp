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
			id_ppdb,
			nama,
			email,
			status,
			telepon,
			tgl_lahir,
			alamat,
			nik,
			no_daftar,
		} = req.body;

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
			return res.status(400).json({
				message:
					"Semua field wajib harus diisi, termasuk id_ppdb untuk detail pembayaran.",
			});
		}

		const pembayaranInfo = await ppdb_pembayaran.findOne({
			where: { id: id_ppdb },
			include: {
				model: Unit,
				as: "unit",
				attributes: ["nama_unit"],
			},
		});

		if (
			!pembayaranInfo ||
			typeof pembayaranInfo.jumlah_pembayaran === "undefined"
		) {
			return res.status(404).json({
				message:
					"Detail pembayaran tidak ditemukan atau jumlah pembayaran tidak valid untuk id_ppdb yang diberikan.",
			});
		}
		const grossAmount = pembayaranInfo.jumlah_pembayaran;
		const generatedNoDaftar = no_daftar || generateRandomNoDaftar();

		let newDaftarPpdb;
		try {
			newDaftarPpdb = await daftar_ppdb.create({
				id_ppdb,
				no_daftar: generatedNoDaftar,
				nama,
				email,
				status,
				telepon,
				tgl_lahir,
				alamat,
				nik,
				status_pembayaran: "unpaid",
				midtrans_url: null,
				midtrans_order_id: null,
			});
		} catch (dbError) {
			console.error("Error creating daftar_ppdb entry:", dbError);
			return res.status(500).json({
				message: "Gagal menyimpan data pendaftaran.",
				error: dbError.message,
			});
		}

		const midtransOrderId = `PPDB-${generatedNoDaftar}-${Date.now()}`;
		const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:8010";

		const parameter = {
			transaction_details: {
				order_id: midtransOrderId,
				gross_amount: parseFloat(grossAmount),
			},
			credit_card: {
				secure: true,
			},
			customer_details: {
				first_name: nama,
				last_name: nama,
				email: email,
				phone: telepon,
			},
			callbacks: {
				finish: `${appBaseUrl}/daftar-ppdb/status-pembayaran/${newDaftarPpdb.id}`,
			},
			item_details: [
				{
					id: `REG-${newDaftarPpdb.id}`,
					price: parseFloat(grossAmount),
					quantity: 1,
					name: `Biaya Pendaftaran PPDB ${
						pembayaranInfo.unit ? pembayaranInfo.unit.nama_unit : ""
					}`.trim(),
				},
			],
		};

		let transaction;
		try {
			transaction = await snap.createTransaction(parameter);
		} catch (midtransError) {
			console.error("Error creating Midtrans transaction:", midtransError);
			return res.status(500).json({
				error: "Failed to create Midtrans transaction",
				details: midtransError.message,
			});
		}

		await newDaftarPpdb.update({
			midtrans_url: transaction.redirect_url,
			midtrans_order_id: midtransOrderId,
		});

		const finalData = await daftar_ppdb.findOne({
			where: { id: newDaftarPpdb.id },
		});

		try {
			const fonnteResponse = await fetch("https://api.fonnte.com/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `${process.env.FONNTE_API_KEY}`, // API key Fonnte dari .env
				},
				body: JSON.stringify({
					target: telepon, // Nomor telepon penerima
					message: `
Assalamu’alaikum Warahmatullahi Wabarakatuh

Yth. Bapak/Ibu Orang Tua/Wali dari Ananda *${nama}*

Alhamdulillah, pendaftaran PPDB telah berhasil kami terima dengan rincian sebagai berikut:
🧾 Nomor Pendaftaran: *${generatedNoDaftar}*
💰 Jumlah Pembayaran: *Rp ${grossAmount.toLocaleString("id-ID")}*
📅 Tanggal Pendaftaran: *${new Date().toLocaleDateString("id-ID")}*

Silakan selesaikan pembayaran melalui tautan berikut:
🔗 *${transaction.redirect_url}*

Terima kasih atas kepercayaan Bapak/Ibu kepada sekolah kami. Semoga Allah SWT senantiasa memberikan kemudahan dan keberkahan.

Hormat kami,
Tim PPDB Sekolah
      `.trim(),
				}),
			});

			if (!fonnteResponse.ok) {
				throw new Error(`Fonnte API error: ${fonnteResponse.statusText}`);
			}

			const fonnteData = await fonnteResponse.json();
			console.log("Pesan berhasil dikirim:", fonnteData);
		} catch (fonnteError) {
			console.error(
				"Gagal mengirim pesan melalui Fonnte:",
				fonnteError.message
			);
		}

		return res.status(201).json({
			message: "Data berhasil ditambahkan dan transaksi Midtrans dibuat.",
			data: finalData,
		});
	} catch (error) {
		console.error("Error in createData:", error);
		if (!res.headersSent) {
			return res.status(500).json({
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

const updateMidtransLink = async (req, res) => {
	try {
		const { id } = req.params; // ID dari data daftar_ppdb

		// Cari data berdasarkan ID
		const daftar = await daftar_ppdb.findOne({
			where: { id },
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

		if (!daftar) {
			return res.status(404).json({
				message: "Data tidak ditemukan.",
			});
		}

		// Ambil informasi pembayaran
		const grossAmount = daftar.ppdb_pembayaran.jumlah_pembayaran;
		const midtransOrderId = `PPDB-${daftar.no_daftar}-${Date.now()}`;
		const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:8010";

		// Parameter untuk Midtrans
		const parameter = {
			transaction_details: {
				order_id: midtransOrderId,
				gross_amount: parseFloat(grossAmount),
			},
			credit_card: {
				secure: true,
			},
			customer_details: {
				first_name: daftar.nama,
				last_name: daftar.nama,
				email: daftar.email,
				phone: daftar.telepon,
			},
			callbacks: {
				finish: `${appBaseUrl}/daftar-ppdb/status-pembayaran/${daftar.id}`,
			},
			item_details: [
				{
					id: `REG-${daftar.id}`,
					price: parseFloat(grossAmount),
					quantity: 1,
					name: `Biaya Pendaftaran PPDB ${
						daftar.ppdb_pembayaran.unit
							? daftar.ppdb_pembayaran.unit.nama_unit
							: ""
					}`.trim(),
				},
			],
		};

		// Generate ulang transaksi Midtrans
		let transaction;
		try {
			transaction = await snap.createTransaction(parameter);
		} catch (midtransError) {
			console.error("Error creating Midtrans transaction:", midtransError);
			return res.status(500).json({
				error: "Failed to create Midtrans transaction",
				details: midtransError.message,
			});
		}

		// Perbarui link Midtrans di database
		await daftar.update({
			midtrans_url: transaction.redirect_url,
			midtrans_order_id: midtransOrderId,
		});

		return res.status(200).json({
			message: "Link Midtrans berhasil diperbarui.",
			data: {
				id: daftar.id,
				midtrans_url: transaction.redirect_url,
			},
		});
	} catch (error) {
		console.error("Error updating Midtrans link:", error);
		return res.status(500).json({
			message: "Terjadi kesalahan pada server.",
			error: error.message,
		});
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
	updateMidtransLink,
};
