// server.js

// http://www.odindesign-themes.com/theBebop/comic/
// http://themeforest.net/item/fc-football-club-template-soccer-psd/9326478?WT.oss_phrase=soccer&WT.oss_rank=6&WT.z_author=uouapps&WT.ac=search_thumb

// BASE SETUP
// =============================================================================
// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var fs = require('fs');


// MONGO DB -------------------------------
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/hot-trophy');


// PKG -------------------------------
var pkg = require('./../package.json');


// PASSPORT JS -------------------------------
// Initialize Passport!  Note: no need to use session middleware when each
// request carries authentication credentials, as is the case with HTTP Basic.
var passport = require('./core/middleware/Passport');
app.use(passport.initialize());


// SERVER CONFIG -------------------------------
var port = process.env.PORT || 2002;        // set our port

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.disable('etag');



// MIDDLEWARE
// =============================================================================
var MiddleWareRouter = express.Router();              // get an instance of the express Router


// STATIC RESPONSES -------------------------------
var staticResponses = [];
var pathToStaticResponses = process.cwd() + '/core/responses';
fs.readdirSync(pathToStaticResponses).forEach(function (file) {
    if (file.indexOf('.js') !== -1) {
        staticResponses.push(
            require(pathToStaticResponses + '/' + file)
        );
    }
});
MiddleWareRouter.use(staticResponses);


// CUSTOM MIDDLEWARE -------------------------------
MiddleWareRouter.use(require('./core/middleware/ContentTypeValidator'));
app.use('/api', MiddleWareRouter);


// CONFIGURATIONS -------------------------------
app.all('/api', function (req, res, next) {
    // set origin policy etc so cross-domain access wont be an issue
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Authorization, Content-Type, Accept");
    next();
});


// ERROR HANDLING -------------------------------
var errorHandlings = [];
var pathToerrorHandlings = process.cwd() + '/core/errorHandling';
fs.readdirSync(pathToerrorHandlings).forEach(function (file) {
    if (file.indexOf('.js') !== -1) {
        errorHandlings.push(
            require(pathToerrorHandlings + '/' + file)
        );
    }
});
app.use(errorHandlings);



// ROUTES FOR OUR API
// =============================================================================


// LOGIN ROUTES -------------------------------
// curl -v -I -H "Content-Type:application/json" http://127.0.0.1:2002/api/auth/login
// curl -v -I -H "Content-Type:application/json" --user bob:secret http://127.0.0.1:2002/
var AuthCtrl = require('./api/controllers/Auth');
app.get('/api/auth/login',
    // Authenticate using HTTP Basic credentials, with session support disabled.
    passport.authenticate('basic', {session: false}),
    AuthCtrl.login
);


// SECURE ROUTES WITH ACCESS TOKEN -------------------------------
//app.all('/api/secure/*', function (req, res, next) {
//    console.log('*** SECURE ****');
//    next();// pass control to the next handler
//});


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




// PROTECTED ROUTES -------------------------------
//app.all('/api/public/*', function (req, res, next) {
//    console.log('--- PUBLIC ---');
//    next();// pass control to the next handler
//});
//app.all('/api/auth/*', function (req, res, next) {
//    console.log('___ AUTH ___');
//    next();// pass control to the next handler
//});
//app.all('/api/secure/*', function (req, res, next) {
//    console.log('*** SECURE ****');
//    next();// pass control to the next handler
//});