const router = require("express").Router();

const {
	Login,
	Register,
	RegisterSiswa,
} = require("../controllers/auth");

const upload = require("../middlewares/multer");

router.post("/login", Login);
router.post("/register", upload.single("gambar"), Register);
router.post("/register-siswa", upload.single("gambar"), RegisterSiswa);

module.exports = router;
