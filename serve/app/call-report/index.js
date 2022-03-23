'use strict';

const express = require('express');
const controller = require('./call-report.controller');
const { checkAuth } = require('../middleware');
var router = express.Router();

router.post('/download/csv/:orgId', checkAuth, controller.downloadCallReportCSVFile);
router.post('/download/pdf/:orgId', checkAuth, controller.downdloadCallReportPDFFile);
router.post('/:orgId', checkAuth, controller.getCallReport);

module.exports = router;