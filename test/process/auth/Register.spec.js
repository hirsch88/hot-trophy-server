var request = require('supertest');
var express = require('express');

// http://visionmedia.github.io/superagent/
// https://www.npmjs.com/package/superagent

var server = require('../../../server');

describe('Process: Register -> Login', function () {

    var testUser = {
        username: 'TEST_Hirsch',
        email:    'test@hirsch.ch',
        password: '1234'
    };

    describe('POST auth/login', function () {
        it('should faile, because the user is not yet registerd', function () {
            request(server)
                .post('api/auth/login')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Basic dGVzdEBoaXJzY2guY2g6MTIzNA==')
                .send(testUser)
                .expect(401)
                .end(function (err, res) {
                    should.not.exist(err);

                    done();
                });

        });
    });



});