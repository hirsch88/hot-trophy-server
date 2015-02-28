// api/controllers/Auth.js
var Promise = require('bluebird');

//var config = require('../../config/config');


var User = require('../models/UserModel');
var log = require('../../lib/logger');
var UserService = require('../services/UserService');
var UtilService = require('../services/UtilService');


var AuthController = {

    register: function (req, res) {

        if (!UtilService.hasRequiredAttributes(['username', 'email', 'password'], req.body)) {
            return res.badRequest({
                message:  'Required attributes are missing',
                required: ['username', 'email', 'password']
            })
        }

        var user = {};
        UserService.isUnique(req.body.username, req.body.email)
            .then(function () {
                user.username = req.body.username;
                user.email = req.body.email;
                return req.body.password;
            })
            .then(UserService.cipherPassword)
            .then(function (hashedPassword) {
                user.password = hashedPassword;
            })
            .then(UserService.generateToken)
            .then(function(emailToken){
                return new Promise(function (resolve, reject) {
                    user.emailToken = emailToken;
                    user = new User(user);
                    user.save( function (err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                username: result.username,
                                email:    result.email
                            });
                        }
                    });
                });
            })
            .then(function (user) {
                res.created(user);
            })
            .catch(function (err) {
                res.badRequest(err);
            });

    },

    login: function (req, res) {
        res.ok({
            username:    req.user.username,
            email:       req.user.email,
            accessToken: req.user.accessToken
        });
    },

    logout: function (req, res) {

    }

};

module.exports = AuthController;