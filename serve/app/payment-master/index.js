var express = require("express");
const { route } = require("../auth");
const { checkAuth } = require("../middleware");
var controller = require("./master.controller");
var router = express.Router();

router.post("/add", checkAuth, controller.addpackage);
router.get("", checkAuth, controller.getPackage);
router.patch("/update", checkAuth, controller.updatePackage);
router.delete("/delete/:id", checkAuth, controller.delete);

module.exports = router;
