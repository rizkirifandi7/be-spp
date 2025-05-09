const {
	Tagihan,
	ItemTagihan,
	Pembayaran,
	Akun,
	Jenis_Pembayaran,
	Kas,
	Akun_siswa,
	Kelas,
	Jurusan,
} = require("../models");
const { generateTagihanNumber } = require("../utils/tagihanHelper");

const midtransClient = require("midtrans-client");
const dotenv = require("dotenv");
dotenv.config();

// Diasumsikan Anda akan menggunakan node-fetch untuk API call di backend
const fetch = require("node-fetch"); // Tambahkan ini jika belum ada
const FormData = require("form-data");

let snap = new midtransClient.Snap({
	isProduction: false,
	serverKey: process.env.SERVER_KEY,
	clientKey: process.env.CLIENT_KEY,
});

const createTagihan = async (req, res) => {
	try {
		const { id_siswa, items, deskripsi, id_jenis_pembayaran } = req.body;

		// 1. Dapatkan data siswa untuk kebutuhan Midtrans
		const siswa = await Akun.findByPk(id_siswa, {
			include: [{ model: Akun_siswa, as: "akun_siswa" }],
		});

		if (!siswa) throw new Error("Siswa tidak ditemukan");

		// 2. Buat tagihan utama
		const tagihan = await Tagihan.create({
			id_siswa,
			nomor_tagihan: generateTagihanNumber(),
			id_jenis_pembayaran,
			deskripsi,
			total_jumlah: items.reduce((sum, item) => sum + item.jumlah, 0),
			status: "pending",
			jumlah_bayar: 0,
		});

		// 3. Buat item tagihan + generate Midtrans URL
		const itemTagihan = await Promise.all(
			items.map(async (item) => {
				// Buat item terlebih dahulu
				const newItem = await ItemTagihan.create({
					id_tagihan: tagihan.id,
					id_jenis_pembayaran: item.id_jenis_pembayaran,
					deskripsi: item.deskripsi,
					jumlah: item.jumlah,
					bulan: item.bulan,
					tahun: item.tahun,
					status: "unpaid", // Status awal
					jatuh_tempo: item.jatuh_tempo,
				});

				// Generate unique order_id untuk Midtrans
				const midtransOrderId = `ITEM-${newItem.id}-${Date.now()}`;
				const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:8010";

				// Generate Midtrans URL
				const parameter = {
					transaction_details: {
						order_id: midtransOrderId, // Gunakan order_id yang digenerate
						gross_amount: item.jumlah,
					},
					customer_details: {
						first_name: siswa.nama,
						email: siswa.email,
						phone: siswa.akun_siswa?.telepon || "08123456789", // Default number jika kosong
					},
					item_details: [
						{
							id: newItem.id, // Sebaiknya ini adalah ID item produk, bukan ID ItemTagihan jika memungkinkan
							price: item.jumlah,
							quantity: 1,
							name: item.deskripsi,
						},
					],
					expiry: {
						unit: "day",
						duration: 3,
					},
					callbacks: {
						finish: `${appBaseUrl}/tagihan/konfirmasi/${newItem.id}`, // URL untuk konfirmasi pembayaran
					},
				};

				// Request ke Midtrans
				const transaction = await snap.createTransaction(parameter);

				// Update item dengan payment URL dan midtrans_order_id
				await newItem.update({
					midtrans_url: transaction.redirect_url,
					midtrans_order_id: midtransOrderId, // Simpan order_id Midtrans
				});

				return newItem;
			})
		);

		// 4. Kirim response
		res.status(201).json({
			success: true,
			data: {
				tagihan,
				itemTagihan: itemTagihan.map((item) => ({
					id: item.id,
					deskripsi: item.deskripsi,
					jumlah: item.jumlah,
					midtrans_url: item.midtrans_url, // Pastikan URL disertakan
				})),
			},
		});
	} catch (error) {
		console.error("Error:", error);
		res.status(400).json({
			success: false,
			error: error.message,
		});
	}
};

const buatTagihanPerKelas = async (req, res) => {
	try {
		const { id_kelas, id_jurusan, jatuh_tempo, items } = req.body;

		if (!Array.isArray(items) || items.length === 0) {
			return res.status(400).json({
				success: false,
				error: "Items harus berupa array dan tidak boleh kosong",
			});
		}

		// Ambil semua siswa di kelas dan jurusan tertentu
		const siswaKelas = await Akun_siswa.findAll({
			where: {
				id_kelas,
				...(id_jurusan && { id_jurusan }), // hanya filter jika id_jurusan dikirim
			},
			include: [
				{
					model: Akun,
					as: "akun",
					attributes: ["id", "nama", "email"], // Tambahkan email
				},
			],
			attributes: ["id", "id_akun", "telepon"], // Tambahkan telepon dari Akun_siswa
		});

		if (!siswaKelas.length) {
			return res.status(404).json({
				success: false,
				error: "Tidak ada siswa di kelas dan jurusan ini",
			});
		}

		const hasil = [];

		// Buat tagihan untuk setiap siswa
		for (const siswa of siswaKelas) {
			const total_jumlah = items.reduce((sum, item) => sum + item.jumlah, 0);

			const tagihan = await Tagihan.create({
				id_siswa: siswa.id_akun,
				nomor_tagihan: generateTagihanNumber(),
				id_jenis_pembayaran: items[0].id_jenis_pembayaran, // Asumsi semua item memiliki jenis pembayaran yang sama untuk tagihan utama
				deskripsi: items[0].deskripsi, // Asumsi deskripsi utama diambil dari item pertama
				jatuh_tempo,
				total_jumlah,
				status: "pending",
				jumlah_bayar: 0,
			});

			const itemTagihanPromises = items.map(async (item) => {
				const newItem = await ItemTagihan.create({
					id_tagihan: tagihan.id,
					id_jenis_pembayaran: item.id_jenis_pembayaran,
					deskripsi: item.deskripsi,
					jumlah: item.jumlah,
					bulan: item.bulan,
					tahun: item.tahun,
					status: "unpaid",
					jatuh_tempo: item.jatuh_tempo || jatuh_tempo, // Gunakan jatuh_tempo item jika ada, jika tidak gunakan jatuh_tempo global
				});

				// Generate Midtrans URL
				const parameter = {
					transaction_details: {
						order_id: `ITEM-${newItem.id}-${Date.now()}`,
						gross_amount: item.jumlah,
					},
					customer_details: {
						first_name: siswa.akun.nama,
						email: siswa.akun.email,
						phone: siswa.telepon || "08123456789", // Default number jika kosong
					},
					item_details: [
						{
							id: newItem.id,
							price: item.jumlah,
							quantity: 1,
							name: item.deskripsi,
						},
					],
					expiry: {
						unit: "day",
						duration: 3, // Link expired dalam 3 hari
					},
				};

				// Request ke Midtrans
				const transaction = await snap.createTransaction(parameter);

				// Update item dengan payment URL
				await newItem.update({ midtrans_url: transaction.redirect_url });

				return {
					id: newItem.id,
					deskripsi: newItem.deskripsi,
					jumlah: newItem.jumlah,
					bulan: newItem.bulan,
					tahun: newItem.tahun,
					status: newItem.status,
					midtrans_url: transaction.redirect_url,
				};
			});

			const itemTagihanHasil = await Promise.all(itemTagihanPromises);

			hasil.push({
				siswa: {
					id: siswa.akun.id,
					nama: siswa.akun.nama,
					email: siswa.akun.email,
				},
				tagihan,
				itemTagihan: itemTagihanHasil,
			});
		}

		res.status(201).json({
			success: true,
			data: hasil,
		});
	} catch (error) {
		console.error("Error in buatTagihanPerKelas:", error);
		res.status(400).json({
			success: false,
			error: error.message,
		});
	}
};

const payTagihan = async (req, res) => {
	try {
		const authenticatedUser = req.user;

		if (
			!authenticatedUser ||
			typeof authenticatedUser.id === "undefined" ||
			typeof authenticatedUser.nama === "undefined"
		) {
			console.error(
				"Authentication error in payTagihan: req.user is not properly set or missing id/nama.",
				authenticatedUser
			);
			return res.status(401).json({
				success: false,
				error: "User authentication data is invalid or incomplete.",
			});
		}

		const { id } = req.params;
		const { jumlah, metode_pembayaran, catatan, item_dibayar } = req.body;

		// Dapatkan tagihan beserta itemnya
		const tagihan = await Tagihan.findByPk(id, {
			include: [
				{
					model: ItemTagihan,
					as: "item_tagihan",
				},
			],
		});

		if (!tagihan) {
			return res.status(404).json({
				success: false,
				error: "Tagihan tidak ditemukan",
			});
		}

		// Validasi item yang dibayar
		const items = tagihan.item_tagihan.filter((item) =>
			item_dibayar.includes(item.id)
		);

		if (items.length === 0) {
			return res.status(400).json({
				success: false,
				error: "Tidak ada item yang dipilih untuk dibayar",
			});
		}

		let sisa_tagihan = tagihan.total_jumlah - Number(tagihan.jumlah_bayar);
		if (jumlah <= 0) {
			return res.status(400).json({
				success: false,
				error: "Jumlah pembayaran harus lebih dari 0",
			});
		}
		if (jumlah > sisa_tagihan) {
			return res.status(400).json({
				success: false,
				error: `Jumlah pembayaran melebihi sisa tagihan (Rp ${sisa_tagihan.toLocaleString()})`,
			});
		}

		// 1. Buat record pembayaran
		const pembayaran = await Pembayaran.create({
			id_invoice: tagihan.id,
			id_siswa: tagihan.id_siswa,
			jumlah,
			metode_pembayaran,
			catatan,
			sudah_verifikasi: true,
		});

		// 2. Distribusi pembayaran ke item_tagihan yang dipilih
		let sisaPembayaran = jumlah;
		for (const item of items) {
			const jumlah_terbayar = Number(item.jumlah_terbayar || 0);
			const jumlah_item = Number(item.jumlah);
			const kekurangan = jumlah_item - jumlah_terbayar;

			if (sisaPembayaran <= 0) break;

			let bayarUntukItem = Math.min(kekurangan, sisaPembayaran);
			let jumlah_terbayar_baru = jumlah_terbayar + bayarUntukItem;
			let status_baru = jumlah_terbayar_baru >= jumlah_item ? "paid" : "unpaid";

			await ItemTagihan.update(
				{
					jumlah: jumlah_terbayar_baru,
					status: status_baru,
				},
				{ where: { id: item.id } }
			);

			sisaPembayaran -= bayarUntukItem;
		}

		// 3. Update jumlah_bayar dan status tagihan
		const jumlah_bayar_baru = Number(tagihan.jumlah_bayar) + Number(jumlah);
		let status_tagihan = "partial";
		if (jumlah_bayar_baru >= tagihan.total_jumlah) status_tagihan = "paid";

		await tagihan.update({
			status: status_tagihan,
			jumlah_bayar: jumlah_bayar_baru,
		});

		await Kas.create({
			id_akun: authenticatedUser.id,
			jumlah: jumlah,
			deskripsi: `Pembayaran tagihan ${tagihan.nomor_tagihan} oleh admin ${authenticatedUser.nama}`,
			tipe: "masuk",
		});

		res.json({
			success: true,
			data: {
				pembayaran,
				status_tagihan,
				jumlah_bayar: jumlah_bayar_baru,
				sisa_tagihan: tagihan.total_jumlah - jumlah_bayar_baru,
			},
		});
	} catch (error) {
		console.error("Error in payTagihan:", error);
		res.status(400).json({
			success: false,
			error: error.message,
		});
	}
};

const getAllTagihans = async (req, res) => {
	try {
		const tagihans = await Tagihan.findAll({
			include: [
				{
					model: Akun,
					as: "siswa",
					include: [
						{
							model: Akun_siswa,
							as: "akun_siswa",
							attributes: [
								"id_kelas",
								"id_jurusan",
								"nisn",
								"tgl_lahir",
								"tempat_lahir",
								"jenis_kelamin",
							],
							include: [
								{
									model: Kelas,
									as: "kelas",
									attributes: ["id", "nama_kelas"],
								},
								{
									model: Jurusan,
									as: "jurusan",
									attributes: ["id", "nama_jurusan"],
								},
							],
						},
					],
				},
				{
					model: ItemTagihan,
					as: "item_tagihan",
					include: [
						{
							model: Jenis_Pembayaran,
							as: "jenis_pembayaran",
							attributes: ["id", "nama"],
						},
					],
				},
				{ model: Pembayaran, as: "pembayaran" },
				{
					model: Jenis_Pembayaran,
					as: "jenis_pembayaran",
				},
			],
		});

		res.json({
			success: true,
			data: tagihans,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getTagihanById = async (req, res) => {
	try {
		const tagihan = await Tagihan.findByPk(req.params.id, {
			include: [
				{
					model: Akun,
					as: "siswa",
					attributes: ["id", "nama", "email"],
				},
				{
					model: ItemTagihan,
					as: "item_tagihan",
					include: [
						{
							model: Jenis_Pembayaran,
							as: "jenis_pembayaran",
							attributes: ["id", "nama"],
						},
					],
				},
				{
					model: Pembayaran,
					as: "pembayaran",
					attributes: [
						"id",
						"jumlah",
						"metode_pembayaran",
						"catatan",
						"createdAt",
					],
				},
			],
		});

		if (!tagihan) {
			return res.status(404).json({
				success: false,
				error: "Tagihan tidak ditemukan",
			});
		}

		// Hitung total yang sudah dibayar
		const total_dibayar = await Pembayaran.sum("jumlah", {
			where: { id_invoice: tagihan.id },
		});

		res.json({
			success: true,
			data: {
				...tagihan.toJSON(),
				total_dibayar: total_dibayar || 0,
				sisa_tagihan: tagihan.total_jumlah - (total_dibayar || 0),
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

const updateTagihan = async (req, res) => {
	try {
		const { id } = req.params;
		const { jatuh_tempo, total_jumlah, status } = req.body;

		const tagihan = await Tagihan.findByPk(id);
		if (!tagihan) {
			return res.status(404).json({ error: "Tagihan not found" });
		}

		await tagihan.update({ jatuh_tempo, total_jumlah, status });

		res.json(tagihan);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const deleteTagihan = async (req, res) => {
	try {
		const { id } = req.params;

		const tagihan = await Tagihan.findByPk(id);
		if (!tagihan) {
			return res.status(404).json({ error: "Tagihan not found" });
		}

		await tagihan.destroy();

		res.json({ message: "Tagihan deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const formatToIDRBackend = (amount) => {
	if (isNaN(amount)) return "N/A";
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

const handleMidtransKonfirmasi = async (req, res) => {
	try {
		const { id } = req.params; // This is itemTagihan.id

		const itemTagihan = await ItemTagihan.findByPk(id);

		if (!itemTagihan) {
			return res
				.status(404)
				.send(
					`<html><body><h1>Error</h1><p>Item tagihan ID ${id} tidak ditemukan.</p></body></html>`
				);
		}

		// Verifikasi dengan Midtrans (PENTING di produksi)
		// const transactionStatus = await snap.transaction.status(itemTagihan.midtrans_order_id);
		// if (transactionStatus.transaction_status !== 'capture' && transactionStatus.transaction_status !== 'settlement') {
		//     console.log(`Midtrans transaction status for order ${itemTagihan.midtrans_order_id}: ${transactionStatus.transaction_status}, fraud_status: ${transactionStatus.fraud_status}`);
		//     return res.status(400).send(`<html><body><h1>Info</h1><p>Pembayaran untuk item ID ${id} (${itemTagihan.deskripsi}) belum selesai atau gagal. Status: ${transactionStatus.transaction_status}</p></body></html>`);
		// }

		if (itemTagihan.status === "paid") {
			// Kirim notifikasi WA bahwa sudah dibayar sebelumnya (opsional, jika diperlukan)
			// Untuk saat ini, kita fokus pada notifikasi setelah pembayaran baru berhasil
			return res.send(
				`<html><body><h1>Info</h1><p>Item tagihan ID ${id} (${itemTagihan.deskripsi}) sudah dibayar sebelumnya.</p><p><a href="/">Kembali</a></p></body></html>`
			);
		}

		await itemTagihan.update({
			status: "paid",
			// Jika ada kolom jumlah_terbayar dan ingin diupdate:
			// jumlah_terbayar: itemTagihan.jumlah,
		});

		const tagihan = await Tagihan.findByPk(itemTagihan.id_tagihan);

		if (tagihan) {
			const allItemsForTagihan = await ItemTagihan.findAll({
				where: { id_tagihan: tagihan.id },
			});

			const totalPaid = allItemsForTagihan.reduce((sum, item) => {
				return sum + (item.status === "paid" ? Number(item.jumlah) : 0);
			}, 0);

			const totalJumlahNumeric = Number(tagihan.total_jumlah);
			let newStatusTagihan = "pending";
			if (totalPaid >= totalJumlahNumeric) {
				newStatusTagihan = "paid";
			} else if (totalPaid > 0) {
				newStatusTagihan = "partial";
			}

			await tagihan.update({
				jumlah_bayar: totalPaid,
				status: newStatusTagihan,
			});

			await Pembayaran.create({
				id_invoice: tagihan.id,
				id_siswa: tagihan.id_siswa,
				jumlah: itemTagihan.jumlah,
				metode_pembayaran: "midtrans",
				catatan: `Pembayaran via Midtrans untuk item: ${itemTagihan.deskripsi} (Order ID: ${itemTagihan.midtrans_order_id})`,
				sudah_verifikasi: true,
			});

			const siswaForKas = await Akun.findByPk(tagihan.id_siswa);
			const siswaNamaForKas = siswaForKas
				? siswaForKas.nama
				: `Siswa ID ${tagihan.id_siswa}`;
			await Kas.create({
				id_akun: tagihan.id_siswa, // Sebaiknya ID Akun Admin/Sekolah jika kas ini milik sekolah
				jumlah: itemTagihan.jumlah,
				deskripsi: `Pembayaran Midtrans tagihan ${tagihan.nomor_tagihan} oleh ${siswaNamaForKas} untuk item ${itemTagihan.deskripsi}`,
				tipe: "masuk",
			});

			// --- AWAL BLOK PENGIRIMAN NOTIFIKASI WHATSAPP SUKSES ---
			try {
				const siswaDetails = await Akun.findByPk(tagihan.id_siswa, {
					include: [
						{
							model: Akun_siswa,
							as: "akun_siswa",
							// Explicitly define attributes for Akun_siswa to prevent selecting non-existent columns.
							// 'id' is usually sufficient if you only need its associations.
							// If Akun_siswa has foreign keys like 'id_kelas', 'id_jurusan' and they are needed explicitly, add them.
							attributes: ["id"], // Or ['id', 'id_kelas', 'id_jurusan'] if those are actual FK column names in Akun_siswa table
							include: [
								{ model: Kelas, as: "kelas", attributes: ["nama_kelas"] },
								{ model: Jurusan, as: "jurusan", attributes: ["nama_jurusan"] },
							],
						},
					],
					attributes: ["nama", "telepon"], // This correctly fetches 'telepon' from the Akun model
				});

				if (siswaDetails) {
					const namaSiswa = siswaDetails.nama;
					const kelasSiswa =
						siswaDetails.akun_siswa?.kelas?.nama_kelas || "N/A";
					const jurusanSiswa =
						siswaDetails.akun_siswa?.jurusan?.nama_jurusan || "N/A";
					let teleponSiswa = siswaDetails?.telepon || siswaDetails.telepon;

					if (teleponSiswa) {
						const deskripsiItemLunas = itemTagihan.deskripsi;
						const jumlahItemLunas = formatToIDRBackend(
							parseFloat(itemTagihan.jumlah)
						);

						// Parent Tagihan Details
						const nomorTagihanInduk = tagihan.nomor_tagihan;
						const statusTagihanInduk =
							tagihan.status.charAt(0).toUpperCase() + tagihan.status.slice(1); // e.g., Paid, Partial
						const totalTagihanIndukFormatted = formatToIDRBackend(
							parseFloat(tagihan.total_jumlah)
						);
						const totalTerbayarIndukFormatted = formatToIDRBackend(
							parseFloat(tagihan.jumlah_bayar)
						);
						const sisaTagihanInduk =
							parseFloat(tagihan.total_jumlah) -
							parseFloat(tagihan.jumlah_bayar);
						const sisaTagihanIndukFormatted = formatToIDRBackend(
							sisaTagihanInduk > 0 ? sisaTagihanInduk : 0
						);

						const pesanSukses = `
Assalamu’alaikum Warahmatullahi Wabarakatuh

Yth. Bapak/Ibu Orang Tua/Wali dari Ananda *${namaSiswa}*
Kelas: *${kelasSiswa} ${jurusanSiswa !== "N/A" ? `- ${jurusanSiswa}` : ""}*

Alhamdulillah, pembayaran untuk item:
🧾 Deskripsi: *${deskripsiItemLunas}*
💰 Jumlah: *${jumlahItemLunas}*
Telah BERHASIL kami terima.

Berikut adalah rincian tagihan induk (${nomorTagihanInduk}):
Status: *${statusTagihanInduk}*
Total Tagihan: ${totalTagihanIndukFormatted}
Total Terbayar: ${totalTerbayarIndukFormatted}
Sisa Tagihan: ${sisaTagihanIndukFormatted}

Terima kasih atas pembayaran yang telah dilakukan. Semoga Allah SWT senantiasa memberikan kemudahan dan keberkahan.

Hormat kami,
Tim Keuangan Sekolah
                        `.trim();

						const targetTelepon = teleponSiswa.startsWith("0")
							? `62${teleponSiswa.substring(1)}`
							: teleponSiswa;

						const fonnteApiKey =
							process.env.FONNTE_API_KEY || "QqrpmALC8wz9WvyeqtBF";

						const formData = new FormData();
						formData.append("target", targetTelepon);
						formData.append("message", pesanSukses);
						formData.append("schedule", "0");
						formData.append("delay", "2");
						formData.append("countryCode", "62");

						const fonnteResponse = await fetch("https://api.fonnte.com/send", {
							method: "POST",
							headers: {
								Authorization: fonnteApiKey,
							},
							body: formData,
						});

						const fonnteResult = await fonnteResponse.json();
						if (
							!fonnteResponse.ok ||
							(fonnteResult.status === false && fonnteResult.reason)
						) {
							console.error(
								"Fonnte API Error:",
								fonnteResult?.reason ||
									fonnteResult?.message ||
									"Gagal mengirim WhatsApp sukses."
							);
						} else {
							console.log(
								`Notifikasi WhatsApp sukses pembayaran untuk "${deskripsiItemLunas}" (Tagihan: ${nomorTagihanInduk}) berhasil dikirim ke ${targetTelepon}.`
							);
						}
					} else {
						console.log(
							`Nomor telepon tidak ditemukan untuk siswa ID ${tagihan.id_siswa} (${namaSiswa}), notifikasi sukses pembayaran tidak dikirim.`
						);
					}
				} else {
					console.log(
						`Detail siswa tidak ditemukan untuk siswa ID ${tagihan.id_siswa}, notifikasi sukses pembayaran tidak dikirim.`
					);
				}
			} catch (waError) {
				console.error(
					"Gagal mengirim notifikasi WhatsApp sukses pembayaran:",
					waError.message
				);
			}
			// --- AKHIR BLOK PENGIRIMAN NOTIFIKASI WHATSAPP SUKSES ---
		}

		return res.send(
			`<html><body><h1>Pembayaran Dikonfirmasi</h1><p>Pembayaran untuk item ID ${id} (${
				itemTagihan.deskripsi
			}) telah berhasil dikonfirmasi.</p><p>Status Tagihan Induk: ${
				tagihan ? tagihan.status : "N/A"
			}</p></body></html>`
		);
	} catch (error) {
		console.error("Error handling Midtrans konfirmasi:", error);
		return res
			.status(500)
			.send(
				`<html><body><h1>Error</h1><p>Terjadi kesalahan saat memproses konfirmasi pembayaran: ${error.message}</p></body></html>`
			);
	}
};

module.exports = {
	createTagihan,
	payTagihan,
	getAllTagihans,
	getTagihanById,
	updateTagihan,
	deleteTagihan,
	buatTagihanPerKelas,
	handleMidtransKonfirmasi,
};
