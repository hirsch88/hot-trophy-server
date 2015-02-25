var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/Team');

router.route('/team')
    .get(ctrl.read)
    .post(ctrl.create);

router.route('/team/:team_id')
    .get(ctrl.readById)
    .put(ctrl.update)
    .delete(ctrl.destroy);

module.exports = router;