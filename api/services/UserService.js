var Promise = require('bluebird');
var User = require('../models/UserModel');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var log = require('../../lib/logger');

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
            if (!user) {
                return reject(null);
            }

            generateToken(function (err, newAccessToken) {
                if (err) {
                    return reject(err);
                }

                User.findById(user.id, function (err, user) {

                    if (err) {
                        return reject(err);
                    }

                    if (!user) {
                        return reject(null);
                    }

                    user.accessToken = newAccessToken;
                    user.accessTimestamp = new Date();
                    user.save(function (err) {
                        if (err) {
                            return reject(err);
                        }

                        resolve(user);
                    });

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
function generateToken() {
    return new Promise(function (resolve, reject) {
        crypto.randomBytes(20, function (err, token) {
            if (err) reject(err);

            if (token) {
                resolve(token.toString('hex'));
            }
            else {
                reject(new Error('Problem when generating token'));
            }
        });
    });
}


