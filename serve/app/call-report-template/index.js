"use strict";

const express = require("express");
const controller = require("./call-report-template.controller");
const { checkAuth } = require("../middleware");
var router = express.Router();

//save ext summery
router.post(
  "/saveExtensionSummary",
  checkAuth,
  controller.saveExtensionCallReportsTemplate
);

router.post("", checkAuth, controller.saveCallReportsTemplate);
router.get("/:orgId", checkAuth, controller.getCallReportsTemplate);
router.patch(
  "/:saveCallReportsFilterId",
  checkAuth,
  controller.updateCallReportTemplate
);
router.delete(
  "/:saveCallReportsFilterId",
  checkAuth,
  controller.deleteCallReportTemplate
);
module.exports = router;
