var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/Auth');


router.route('/register')
    .post(ctrl.register);


router.route('/logout')
    .post(ctrl.logout);


module.exports = router;