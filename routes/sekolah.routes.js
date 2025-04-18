const router = require("express").Router();

const {
	getAllData,
	getDataById,
	createData,
	updateData,
	deleteData,
} = require("../controllers/sekolah.controller");

const upload = require("../middlewares/multer");

router.get("/", getAllData);
router.get("/:id", getDataById);
router.post("/", upload.single("gambar"), createData);
router.put("/:id", upload.single("gambar"), updateData);
router.delete("/:id", deleteData);

module.exports = router;
