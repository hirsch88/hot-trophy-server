var mUtil = require('./../mocha.util.js');

var server = mUtil.server;
var log = mUtil.log;
var config = mUtil.config;

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var request = require('supertest');

var mongoose = require('mongoose');


describe('INIT', function () {

    before(function (done) {
        mongoose.connection.collections['users'].drop(function () {
            done();
        });
    });

    describe('POST auth/register', function () {
        it('should return 201 Created', function (done) {

            request(server)
                .post('/api/auth/register')
                .type('json')
                .send(mUtil.getTestUser())
                .expect(201)
                .end(function (err) {
                    should.not.exist(err);
                    done();
                });


        });
    });
});