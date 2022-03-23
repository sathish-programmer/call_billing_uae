'use strict';

var express = require('express');
const {checkAuth} = require("../middleware");
var controller = require('./role.controller');
var router = express.Router();

router.get('/:orgId/:roleId', checkAuth, controller.getSingleRole);
router.get('/fetch_master_role_list', checkAuth, controller.fetchMasterRoleList);
router.get('/:orgId', checkAuth, controller.getRoles);
router.get('', checkAuth, controller.getRole);

router.post('', checkAuth, controller.addRole);

// 3rd party role api
router.post('/v2', checkAuth, controller.addRole_v2);
router.patch('/v2/:roleId', checkAuth, controller.updateRole_v2);
router.delete("/v2/:roleId", checkAuth, controller.deleteRole);
// end

router.patch('/:roleId', checkAuth, controller.updateRole);
router.delete("/:roleId", checkAuth, controller.deleteRole);
module.exports = router;