// PassportJS
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var config = require('../config/config');
var UserService = require(config.root + '/api/services/UserService');


// Use the BasicStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.
passport.use(new BasicStrategy({},
    function (email, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            var user = {};

            UserService.findByEmail(email)
                .then(function (result) {
                    if (!result) {
                        return false;
                    }

                    user = result;
                    return {
                        hash:     user.password,
                        password: password
                    };
                })
                .then(UserService.comparePassword)
                .then(function (result) {
                    return (result) ? user : false;
                })
                .then(UserService.buildAccessTokenForUser)
                .then(function (user) {
                    if (!user) {
                        return done(null, false);
                    } else {
                        // SUCCESS
                        return done(null, user);

                    }
                })
                .catch(done);

        });
    }
));

// HTTP Bearer authentication strategy for Passport.
//   This module lets you authenticate HTTP requests using bearer tokens, as specified by RFC 6750, in your Node.js
//   applications. Bearer tokens are typically used protect API endpoints, and are often issued using OAuth 2.0.
//
//   By plugging into Passport, bearer token support can be easily and unobtrusively integrated into any application
//   or framework that supports Connect-style middleware, including Express.
passport.use(new BearerStrategy(
    function (token, done) {

        UserService.findByAccessToken(token)
            .then(function (user) {
                if (!user) {
                    return done(null, false);
                }
                return done(null, user, {scope: 'all'});
            })
            .catch(done);
    }
));

module.exports = passport;