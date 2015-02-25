var Promise = require('bluebird');
var User = require('../models/UserModel');
var crypto = require('crypto');
var bcrypt = require('bcrypt');

module.exports = {

    findById: function (id) {
        return new Promise(function (resolve, reject) {
            User.findById(id, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    findByUsername: function (username) {
        return new Promise(function (resolve, reject) {
            var query = User.where({username: username});
            query.findOne(function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    findByEmail: function (email) {
        return new Promise(function (resolve, reject) {
            var query = User.where({email: email});
            query.findOne(function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    findByAccessToken: function (accessToken) {
        return new Promise(function (resolve, reject) {
            var query = User.where({accessToken: accessToken});
            query.findOne(function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    isUnique: function (username, email) {
        var scope = this;
        return new Promise(function (resolve, reject) {

            Promise.all([scope.findByUsername(username), scope.findByEmail(email)])
                .then(function (results) {

                    if (results.length !== 2) {
                        return reject(null);
                    }

                    if (results[0] === null && results[1] === null) {
                        return resolve();
                    }

                    var unique = [];
                    if (results[0] !== null) {
                        unique.push('username');
                    }

                    if (results[1] !== null) {
                        unique.push('email');
                    }

                    return reject({
                        unique: unique
                    });
                }).catch(reject);
        });
    },

    generateToken: generateToken,

    buildAccessTokenForUser: function (user) {
        return new Promise(function (resolve, reject) {
            if(!user){
                reject('Unauthorized');
            }

            var newAccessToken = generateToken();
            User.findById(user.id, function (err, user) {

                if (err){
                    reject(err);
                }

                if(!user){
                    reject('Unauthorized');
                }

                user.accessToken = newAccessToken;
                user.save(function (err) {
                    if (err){
                        reject(err);
                    }

                    resolve(user);
                });
            });
        });
    },


    cipherPassword: function (password) {
        var scope = this;
        return new Promise(function (resolve, reject) {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        return reject(err);
                    }

                    resolve(hash);
                });
            });
        });
    },

    comparePassword: function (obj) {
        if (!obj) {
            return false;
        }

        var password = obj.password;
        var hash = obj.hash;
        return new Promise(function (resolve, reject) {
            bcrypt.compare(password, hash, function (err, result) {
                if (err) {
                    return reject(err);
                }

                resolve(result);
            });
        });
    }

};


/**
 *
 * @param data {String} email:password
 * @returns {*}
 */
function generateToken(data) {
    data = data || 'TheBubu:Secret';
    var random = Math.floor(Math.random() * 100001);
    var timestamp = (new Date()).getTime();
    var sha256 = crypto.createHmac("sha256", random + "WOO" + timestamp);
    return sha256.update(data).digest("base64");
}