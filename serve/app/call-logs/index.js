'use strict';

const express = require('express');
const {loginForCallLogs, logout,loginForCallLogspepperstone,logoutpepperstone} = require('../auth/auth.controller');
const controller = require('./call-logs.controller');
const { checkAuthForCallLogs, checkAuth,checkAuthForCallLogspepper } = require('../middleware');
var router = express.Router();

router.post('/login', loginForCallLogs);
router.post('/loginpepperstone', loginForCallLogspepperstone);
router.post('/loginnew', loginForCallLogspepperstone);
router.post('/logout', checkAuthForCallLogs, logout);
router.post('/upload', checkAuthForCallLogs, controller.uploadCallLog);
router.post('/uploadpepperstone', checkAuthForCallLogspepper, controller.uploadCallLog);
router.post('/uploadnew', checkAuthForCallLogspepper, controller.uploadCallLog);
router.post('/logoutpepperstone', checkAuthForCallLogspepper, logoutpepperstone);
router.post('/logoutnew', checkAuthForCallLogspepper, logoutpepperstone);

router.get("/branch/list", checkAuth, controller.getBranchList);
router.get("/department/list", checkAuth, controller.getDepartmentList);
router.get("/extension/list", checkAuth, controller.getExtensionList);
router.get('/logs/all/:orgId', checkAuth, controller.getAllCallLogs);
router.post('/list/:orgId/type-wise', checkAuth, controller.getCallListForDashboard);
router.post('/list/:orgId/summary', checkAuth, controller.getCallSummaryForDashboard);
module.exports = router;