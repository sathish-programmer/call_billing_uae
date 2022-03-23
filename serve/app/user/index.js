'use strict';

var express = require('express');
const {checkAuth} = require("../middleware");
var controller = require('./user.controller');
var router = express.Router();

router.post('', checkAuth, controller.addUser);

// add user for 3rd party app
router.post('/v2', checkAuth, controller.addUserV2);
router.patch('/v2/:userId', checkAuth, controller.updateUser);
router.delete('/v2/:userId', checkAuth, controller.deleteUser);
// end

router.patch('/:userId', checkAuth, controller.updateUser);
router.get('/:orgId', checkAuth, controller.getUsers);
router.delete('/:userId', checkAuth, controller.deleteUser);
router.get('/create_token/:userId', checkAuth, controller.createTokenForDpUser);
router.get('/dp_user/:orgId', checkAuth, controller.getDPUsers);

module.exports = router; 
