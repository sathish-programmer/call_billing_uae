var express = require("express");
const { checkAuth } = require("../middleware");

const controller = require("./paymentHistory.controller");
const router = express.Router();

// save payment history
router.post("/save", checkAuth, controller.savePayment);
// get payment history
router.get("/list/:orgId", checkAuth, controller.list);
// download pdf
router.post("/download/pdf/:uniqueId", checkAuth, controller.generatePdf);
module.exports = router;
