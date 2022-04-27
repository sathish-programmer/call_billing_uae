"use strict";

var express = require("express");
const { route } = require("../auth");
const { checkAuth } = require("../middleware");
var controller = require("./payment.controller");
var router = express.Router();

router.post("/sendOtp", checkAuth, controller.sendOtp);

router.post("/verifyOtp", checkAuth, controller.verifyOtp);

router.post("/addPackage", checkAuth, controller.addPackage);

router.get("/getList", checkAuth, controller.getAllList);

router.delete("/:paymentId", checkAuth, controller.deletePayment);

router.patch("/:paymentId", checkAuth, controller.editPayment);

router.post("/getFullPayDetails", checkAuth, controller.getPaymentDetails);

router.get(
  "/notifyPaymentExpire/:orgId",
  checkAuth,
  controller.notifyPaymentExpire
);

module.exports = router;
