'use strict';

var express = require('express');
const {checkAuth} = require("../middleware");
var controller = require('./sub-department.controller');
var router = express.Router();

router.post('', checkAuth, controller.addSubDepartment);
router.get('/:orgId', checkAuth, controller.getSubDepartmentList);
router.patch('/:subDepartmentId', checkAuth, controller.updateSubDepartment);
router.delete('/:subDepartmentId', checkAuth, controller.deleteSubDepartment);
module.exports = router;