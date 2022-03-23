'use strict';

var express = require('express');
const {checkAuth} = require("../middleware");
var controller = require('./department.controller');
var router = express.Router();

router.post('', checkAuth, controller.addDepartment);
router.get('/:orgId', checkAuth, controller.getDepartmentList);
router.patch('/:departmentId', checkAuth, controller.updateDepartment);
router.delete('/:departmentId', checkAuth, controller.deleteDepartment);
module.exports = router;