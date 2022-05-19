var express = require("express");
const { checkAuth } = require("../../middleware");

const controller = require("./otp-controller");
const router = express.Router();

router.post("/save", checkAuth, controller.saveTemplate);
router.get("/getTemplate", checkAuth, controller.getTemplate);

module.exports = router;
