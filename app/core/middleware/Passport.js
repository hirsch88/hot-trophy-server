// PassportJS
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

var UserService = require('../../api/services/UserService');


// Use the BasicStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.
passport.use(new BasicStrategy({},
    function (email, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            var userOutput = {};

            UserService.findByEmail(email)
                .then(function (user) {
                    if (!user) {
                        return false;
                    }

                    userOutput.email = user.email;
                    userOutput.username = user.username;

                    return {
                        hash:     user.password,
                        password: password
                    };
                })
                .then(UserService.comparePassword)
                .then(function (result) {
                    if (!result) {
                        return done(null, false);
                    } else {
                        // SUCCESS
                        return done(null, userOutput);
                    }
                })
                .catch(done);

        });
    }
));

module.exports = passport;