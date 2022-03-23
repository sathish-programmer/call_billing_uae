'use strict';

const express = require('express');
const controller = require('./auth.controller');
const { checkAuth,checkAuthForCallLogspepper} = require('../middleware');
var router = express.Router();

router.post('/login', controller.login);
router.post('/logout', checkAuth, controller.logout);
router.post('/logoutpepperstone', checkAuthForCallLogspepper, controller.logout);

module.exports = router;