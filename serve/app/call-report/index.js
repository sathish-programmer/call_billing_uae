"use strict";

const express = require("express");
const controller = require("./call-report.controller");
const { checkAuth } = require("../middleware");
var router = express.Router();

router.post(
  "/download/csv/:orgId",
  checkAuth,
  controller.downloadCallReportCSVFile
);
router.post(
  "/download/pdf/:orgId",
  checkAuth,
  controller.downdloadCallReportPDFFile
);
router.post(
  "/download/pdfByExtension/:orgId",
  checkAuth,
  controller.downdloadCallReportPDFByExt
);
router.post("/:orgId", checkAuth, controller.getCallReport);

router.post(
  "/extensionRecord/:orgId",
  checkAuth,
  controller.getCallReportExtension
);

module.exports = router;
