var express = require("express");
const { checkAuth } = require("../middleware");

const controller = require("./paymentHistory.controller");
const router = express.Router();

// save payment history
router.post("/save", checkAuth, controller.savePayment);
// get payment history
router.get("/list/:orgId", checkAuth, controller.list);
// download pdf
router.get("/download/pdf/:uniqueId", checkAuth, controller.generatePdf);

router.post("/download/getPdf", checkAuth, controller.generatePdfByMonth);

router.get("/lastMonthRecord/:orgId", checkAuth, controller.lastMonthRecord);

router.get("/monthRecord/:orgId", checkAuth, controller.monthRecord);

module.exports = router;
