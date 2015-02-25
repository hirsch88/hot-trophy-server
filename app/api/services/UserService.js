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
                    if(results[0]!== null){
                        unique.push('username');
                    }

                    if(results[1]!== null){
                        unique.push('email');
                    }

                    return reject({
                        unique: unique
                    });
                }).catch(reject);
        });
    },

    /**
     *
     * @param data {String} email:password
     * @returns {*}
     */
    generateToken: function (data) {
        var random = Math.floor(Math.random() * 100001);
        var timestamp = (new Date()).getTime();
        var sha256 = crypto.createHmac("sha256", random + "WOO" + timestamp);
        return sha256.update(data).digest("base64");
    },


    cipherPassword: function (password) {
        var scope = this;
        return new Promise(function (resolve, reject) {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    if(err){
                        return reject(err);
                    }

                    resolve(hash);
                });
            });
        });
    },

    comparePassword: function (id, password) {
        var scope = this;
        return new Promise(function (resolve, reject) {
            scope.findById(id)
                .then(function (user) {
                    if(!user){
                        return reject(null);
                    }

                    bcrypt.compare(password, user.password, function (err, result) {
                        if (err) {
                            return reject(err);
                        }

                        resolve(result);
                    });
                })
                .catch(reject);
        });
    }

};