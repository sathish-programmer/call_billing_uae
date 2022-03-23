'use strict';

var express = require('express');
const {checkAuth} = require("../middleware");
var controller = require('./provider.controller');
var router = express.Router();

router.post('', checkAuth, controller.createProvider);
router.patch('/:providerId', checkAuth, controller.updateProvider);
router.get('/:orgId', checkAuth, controller.getProviderList);
router.delete('/:providerId', checkAuth, controller.deleteProvider);

module.exports = router;