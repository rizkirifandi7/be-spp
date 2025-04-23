// Fungsi untuk generate nomor daftar acak
function generateRandomNoDaftar() {
	const prefix = "PPDB"; // Anda bisa menyesuaikan prefix ini
	const randomNumber = Math.floor(100000 + Math.random() * 900000); // Angka acak 6 digit

	return `${prefix}-${randomNumber}`;
}

module.exports = generateRandomNoDaftar;