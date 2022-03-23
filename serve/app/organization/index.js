'use strict';

var express = require('express');
const {checkAuth} = require("../middleware");
var controller = require('./organization.controller');
var router = express.Router();

router.post('', checkAuth, controller.createOrganization);

// create org for 3rd party app
router.post('/v2', checkAuth, controller.createOrganization);
router.patch('/v2/:orgId', checkAuth, controller.updateOrganization);
router.delete('/v2/:orgId', checkAuth, controller.deleteOrganiztion);
// end 

// api for org, role, user to use in other websites
router.post('/v1', checkAuth, controller.createOrganization);

router.get('/list', checkAuth, controller.getOrganizationList);
router.get('', checkAuth, controller.getOrganizationListForDropDown);
router.patch('/:orgId', checkAuth, controller.updateOrganization);
router.delete('/:orgId', checkAuth, controller.deleteOrganiztion);
module.exports = router;