const router = require("express").Router();
const {
	getAllData,
	getDataById,
	createData,
	updateData,
	deleteData,
} = require("../controllers/daftar-ppdb.controller");

router.get("/", getAllData);
router.get("/:id", getDataById);
router.post("/", createData);
router.put("/:id", updateData);
router.delete("/:id", deleteData);

module.exports = router;
