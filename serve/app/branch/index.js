'use strict';

var express = require('express');
const {checkAuth} = require("../middleware");
var controller = require('./branch.controller');
var router = express.Router();

router.post('', checkAuth, controller.addBranch);
router.get('/:orgId', checkAuth, controller.getBranchList);
router.patch('/:branchId', checkAuth, controller.updateBranch);
router.delete("/:branchId", checkAuth, controller.deleteBranch);
module.exports = router;