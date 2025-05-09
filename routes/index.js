const router = require("express").Router();

const kasRouter = require("./kas");
const akunRouter = require("./akun");
const authRouter = require("./auth");
const unitRouter = require("./unit");
const bulanRouter = require("./bulan");
const kelasRouter = require("./kelas");
const jurusanRouter = require("./jurusan");
const sekolahRouter = require("./sekolah");
const broadcastRouter = require("./broadcast");
const daftarPPDBRouter = require("./daftar-ppdb");
const pembayaranRouter = require("./pembayaran");
const ppdbPembayaranRouter = require("./ppdb-pembayaran");
const jenisPembayaranRouter = require("./jenis-pembayaran");
const tagihanRouter = require("./tagihan");
const itemTagihanRouter = require("./item-tagihan");

// auth
router.use("/auth", authRouter);
router.use("/akun", akunRouter);
router.use("/daftar-ppdb", daftarPPDBRouter);

// main data
router.use("/kas", kasRouter);
router.use("/unit", unitRouter);
router.use("/bulan", bulanRouter);
router.use("/kelas", kelasRouter);
router.use("/sekolah", sekolahRouter);
router.use("/jurusan", jurusanRouter);

// broadcast
router.use("/broadcast", broadcastRouter);

// pembayaran dan jenis pembayaran
router.use("/pembayaran", pembayaranRouter);
router.use("/ppdb-pembayaran", ppdbPembayaranRouter);
router.use("/jenis-pembayaran", jenisPembayaranRouter);
router.use("/tagihan", tagihanRouter);
router.use("/item-tagihan", itemTagihanRouter);

module.exports = router;
