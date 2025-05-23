const router = require("express").Router();

const {
	createTagihan,
	payTagihan,
	getAllTagihans,
	getTagihanBySiswaId,
	getTagihanById,
	updateTagihan,
	deleteTagihan,
	buatTagihanPerKelas,
	handleMidtransKonfirmasi,
	renewMidtransPaymentLink,
} = require("../controllers/tagihan");

const authenticateJWT = require("../middlewares/verifyToken");

router.post("/", authenticateJWT, createTagihan);
router.post("/bayar/:id", authenticateJWT, payTagihan);
router.get("/", getAllTagihans);
router.get("/siswa/:id", authenticateJWT, getTagihanBySiswaId);
router.get("/:id", getTagihanById);
router.put("/:id", updateTagihan);
router.delete("/:id", authenticateJWT, deleteTagihan);
router.post("/per-kelas", buatTagihanPerKelas);
router.get("/konfirmasi/:id", handleMidtransKonfirmasi);
router.post("/item-tagihan/:id/renew-link", renewMidtransPaymentLink);

module.exports = router;
