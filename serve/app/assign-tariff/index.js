"use strict";

var express = require("express");
const { checkAuth } = require("../middleware");
var controller = require("./assign-tariff.controller");
var router = express.Router();

router.post("", checkAuth, controller.assignTariff);
router.patch("/:assignTariffId", checkAuth, controller.updateAssignTariff);
router.get("/:orgId", checkAuth, controller.getAssignedTariffList);
router.delete("/:assignTariffId", checkAuth, controller.deleteAssignedTariff);

module.exports = router;
