const router = require("express").Router();

const { getAllData, getDataById } = require("../controllers/item-tagihan");

router.get("/", getAllData);
router.get("/:id", getDataById);

module.exports = router;
