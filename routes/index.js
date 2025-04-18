const router = require("express").Router();

const sekolahRouter = require("./sekolah.routes");
const roleRouter = require("./role.routes");
const unitRouter = require("./unit.routes");

router.use("/sekolah", sekolahRouter);
router.use("/role", roleRouter);
router.use("/unit", unitRouter);

module.exports = router;
