const router = require("express").Router();

const {
	getAllData,
	getAllDataSiswa,
	getDataById,
	getDataByIdSiswa,
	createData,
	updateData,
	UpdateSiswa,
	deleteData,
} = require("../controllers/akun");

const upload = require("../middlewares/multer");

router.get("/", getAllData);
router.get("/siswa", getAllDataSiswa);
router.get("/:id", getDataById);
router.get("/siswa/:id", getDataByIdSiswa);
router.post("/", upload.single("gambar"), createData);
router.put("/:id", upload.single("gambar"), updateData);
router.put("/siswa/:id", upload.single("gambar"), UpdateSiswa);
router.delete("/:id", deleteData);

module.exports = router;
