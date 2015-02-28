process.env.NODE_ENV = 'test';

module.exports.server = require('../server');
module.exports.config = require('../config/config');
module.exports.log = require('../lib/logger');

module.exports.getTestUser = function(){
    return {
        username: 'TEST',
        email:    'test@test.ch',
        password: '1234'
    }
};

module.exports.testUserBasicAuthToken = 'Basic dGVzdEB0ZXN0LmNoOjEyMzQ=';

module.exports.login = function(  ){



};
