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
                        //{
                        //    username:    user.username,
                        //    email:       user.email,
                        //    accessToken: user.accessToken
                        //});
                    }
                })
                .catch(done);

        });
    }
));

module.exports = passport;