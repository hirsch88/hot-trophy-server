var express = require('express');
var router = express.Router();
var glob = require('glob');
var logger = require('../lib/logger');

// GRAB ALL API CONTROLLERS
// =============================================================================
var Controller = {};
var pathToApiCtrl = 'api/controllers/';
glob.sync(pathToApiCtrl + '*.js', {}).forEach(function (file) {
    Controller[file.substring(0, file.length - 3).replace(pathToApiCtrl,'')] = require('../' + file);
});

// ROUTES
// =============================================================================
router.use(function timeLog(req, res, next) {
    //logger.info('Routes', 'Time: ' + Date.now());
    next();
});


// AUTH -------------------------------
router.route('/auth/register')
    .post(Controller.Auth.register);

router.route('/auth/logout')
    .post(Controller.Auth.logout);


// SCHEDULER -------------------------------
router.route('/public/schedule')
    .post(Controller.Schedule.generate);


// TEAM -------------------------------
router.route('/public/team')
    .get(Controller.Team.read);

router.route('/secure/team')
    .get(Controller.Team.read)
    .post(Controller.Team.create);

router.route('/secure/team/:team_id')
    .get(Controller.Team.readById)
    .put(Controller.Team.update)
    .delete(Controller.Team.destroy);



module.exports = router;