// server.js

// http://www.odindesign-themes.com/theBebop/comic/
// http://themeforest.net/item/fc-football-club-template-soccer-psd/9326478?WT.oss_phrase=soccer&WT.oss_rank=6&WT.z_author=uouapps&WT.ac=search_thumb

// BASE SETUP
// =============================================================================
// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
//var fs = require('fs');
//var util = require('util');

// MongoDB
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/hot-trophy');

// PKG
var pkg = require('./../package.json');

//// PassportJS
// Initialize Passport!  Note: no need to use session middleware when each
// request carries authentication credentials, as is the case with HTTP Basic.
var passport = require('./core/middleware/Passport');
app.use(passport.initialize());

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('json spaces', 4);
app.disable('etag');

var port = process.env.PORT || 2002;        // set our port


// ROUTES FOR OUR API
// =============================================================================
var MiddleWareRouter = express.Router();              // get an instance of the express Router


// STATIC RESPONSES -------------------------------
MiddleWareRouter.use(require('./core/middleware/responses/NotFound'));
MiddleWareRouter.use(require('./core/middleware/responses/NotAcceptable'));
MiddleWareRouter.use(require('./core/middleware/responses/BadRequest'));
MiddleWareRouter.use(require('./core/middleware/responses/ServerError'));

MiddleWareRouter.use(require('./core/middleware/responses/Ok'));
MiddleWareRouter.use(require('./core/middleware/responses/Created'));
MiddleWareRouter.use(require('./core/middleware/responses/NoContent'));


// MIDDLEWARE -------------------------------
MiddleWareRouter.use(require('./core/middleware/ContentTypeValidator'));
app.use('/api', MiddleWareRouter);


// PROTECTED ROUTES -------------------------------
app.all('/api/public/*', function (req, res, next) {
    console.log('--- PUBLIC ---');
    next();// pass control to the next handler
});

app.all('/api/auth/*', function (req, res, next) {
    console.log('___ AUTH ___');
    next();// pass control to the next handler
});

// curl -v -I -H "Content-Type:application/json" http://127.0.0.1:2002/api/auth/login
// curl -v -I -H "Content-Type:application/json" --user bob:secret http://127.0.0.1:2002/
var AuthCtrl = require('./api/controllers/Auth');
app.get('/api/auth/login',
    // Authenticate using HTTP Basic credentials, with session support disabled.
    passport.authenticate('basic', { session: false }),
    AuthCtrl.login
);


app.all('/api/secure/*', function (req, res, next) {
    console.log('*** SECURE ****');
    next();// pass control to the next handler
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /auth
//var AuthRoutes = require('./api/routes/AuthRoutes');
app.use('/api/auth', [
    require('./api/routes/AuthRoutes')
]);

// all of our routes will be prefixed with /public
//var TeamRoutes = require('./api/routes/TeamRoutes');
app.use('/api/public', [
    require('./api/routes/TeamRoutes')
]);

// all of our routes will be prefixed with /api
//var TeamRoutes = require('./api/routes/TeamRoutes');
app.use('/api/secure', [
    require('./api/routes/TeamRoutes')
]);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);


// curl -i -X POST -d '{ "sign": "VCF", "name": "Valencia CF" } ' http://localhost:2004/api/team
// CONTROLLERS FOR OUR API
// =============================================================================
//var Controller = {};
//var pathToControllers = process.cwd() + '/api/controllers';
//fs.readdirSync(pathToControllers).forEach(function (file) {
//    if (file.indexOf('.js') !== -1) {
//        Controller[file.split('.')[0]] = require(pathToControllers + '/' + file);
//    }
//});
// Team on routes that end in /teams and /team/:team_id
// ----------------------------------------------------
//router.route('/team')
//    .get(Controller.Team.read)
//    .post(Controller.Team.create);
//
//router.route('/team/:team_id')
//    .get(Controller.Team.readById)
//    .put(Controller.Team.update)
//    .delete(Controller.Team.destroy);