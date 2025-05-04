const router = require("express").Router();
const {
	getAllData,
	getDataById,
	createData,
	updateData,
	deleteData,
	createSnap,
	updatePaymentStatus,
} = require("../controllers/daftar-ppdb.controller");

router.get("/", getAllData);
router.get("/:id", getDataById);
router.post("/", createData);
router.put("/:id", updateData);
router.delete("/:id", deleteData);
router.post("/snap/:id", createSnap);
router.get("/status-pembayaran/:id", updatePaymentStatus);

module.exports = router;
