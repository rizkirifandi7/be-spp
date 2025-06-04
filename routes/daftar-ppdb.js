const router = require("express").Router();
const {
	getAllData,
	getDataById,
	createData,
	updateData,
	deleteData,
	createSnap,
	updatePaymentStatus,
	updateMidtransLink,
} = require("../controllers/daftar-ppdb");

router.get("/", getAllData);
router.get("/:id", getDataById);
router.post("/", createData);
router.put("/:id", updateData);
router.delete("/:id", deleteData);
router.post("/snap/:id", createSnap);
router.get("/status-pembayaran/:id", updatePaymentStatus);
router.put("/midtrans-link/:id", updateMidtransLink);

module.exports = router;
