const router = require("express").Router();

const {
	createTagihan,
	payTagihan,
	getAllTagihans,
	getTagihanById,
	updateTagihan,
	deleteTagihan,
	buatTagihanPerKelas,
	handleMidtransKonfirmasi,
} = require("../controllers/tagihan");

const authenticateJWT = require("../middlewares/verifyToken");

router.post("/", authenticateJWT, createTagihan);
router.post("/bayar/:id", authenticateJWT, payTagihan);
router.get("/", getAllTagihans);
router.get("/:id", getTagihanById);
router.put("/:id", updateTagihan);
router.delete("/:id", authenticateJWT, deleteTagihan);
router.post("/per-kelas", buatTagihanPerKelas);
router.get("/konfirmasi/:id", handleMidtransKonfirmasi);

module.exports = router;
