const router = require("express").Router();

const sekolahRouter = require("./sekolah.routes");
const roleRouter = require("./role.routes");
const unitRouter = require("./unit.routes");
const bulanRouter = require("./bulan.routes");
const kasRouter = require("./kas.routes");
const kelasRouter = require("./kelas.routes");
const jurusanRouter = require("./jurusan.routes");
const broadcastRouter = require("./broadcast.routes");
const jenisPembayaranRouter = require("./jenis-pembayaran.routes");
const akunRouter = require("./akun.routes");
const ppdbPembayaranRouter = require("./ppdb-pembayaran.routes");
const daftarPPDBRouter = require("./daftar-ppdb.routes");
const authRouter = require("./auth.routes");

router.use("/sekolah", sekolahRouter);
router.use("/role", roleRouter);
router.use("/unit", unitRouter);
router.use("/bulan", bulanRouter);
router.use("/kas", kasRouter);
router.use("/kelas", kelasRouter);
router.use("/jurusan", jurusanRouter);
router.use("/broadcast", broadcastRouter);
router.use("/jenis-pembayaran", jenisPembayaranRouter);
router.use("/akun", akunRouter);
router.use("/ppdb-pembayaran", ppdbPembayaranRouter);
router.use("/daftar-ppdb", daftarPPDBRouter);
router.use("/auth", authRouter);

module.exports = router;
