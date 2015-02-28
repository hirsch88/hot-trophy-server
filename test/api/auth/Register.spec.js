var mUtil = require('../../mocha.util.js');

var server = mUtil.server;
var log = mUtil.log;
var config = mUtil.config;

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var request = require('supertest');

describe('Process: Register -> Login', function () {

    var testUser = {
        username: 'TEST_Register',
        email:    'test.register@test.ch',
        password: '1234'
    };

    var basicAuth = 'Basic dGVzdC5yZWdpc3RlckB0ZXN0LmNoOjEyMzQ=';

    before(function (done) {
        done();
    });

    describe('POST auth/register', function () {
        it('should return 201 Created', function (done) {

            request(server)
                .post('/api/auth/register')
                .type('json')
                .send({
                    username: 'TEST_Register',
                    email:    'test.register@test.ch',
                    password: '1234'
                })
                .expect(201)
                .end(function (err, res) {
                    if(err){
                        log.error(res.text);
                    }
                    should.not.exist(err);
                    done();
                });


        });
    });

    //describe('POST auth/login', function () {
    //    it('should return 200 Created and a access token', function (done) {
    //
    //        request(server)
    //            .post('/api/auth/login')
    //            .type('json')
    //            .send(testUser)
    //            .expect(201)
    //            .end(function (err) {
    //                should.not.exist(err);
    //                done();
    //            });
    //
    //
    //    });
    //});

});


//var mUtil = require('../../mocha.util');
//
//var server = mUtil.server;
//var log = mUtil.log;
//
//var chai = require('chai'),
//    expect = chai.expect,
//    should = chai.should();
//
//var request = require('supertest');
//var express = require('express');
//
//
//describe('Process: Register -> Login', function () {
//
//    var testUser = {
//        username: 'TEST_Register',
//        email:    'test.register@test.ch',
//        password: '1234'
//    };
//
//    describe('POST auth/login', function () {
//
//        it('should return 406, because no json header set ', function () {
//
//            request(server)
//                .post('/api/auth/login')
//                .expect(406)
//                .end(function (err, res) {
//                    should.not.exist(err);
//                });
//
//
//        });
//
//        it('should return 401, because the user is not yet registered', function () {
//
//            request(server)
//                .post('/api/auth/login')
//                .set('Authorization', 'Basic dGVzdEBoaXJzY2guY2g6MTIzNA==')
//                .set('Content-Type', 'application/json')
//                .send(testUser)
//                .expect(401)
//                .end(function (err, res) {
//                    should.not.exist(err);
//                });
//
//        });
//
//
//
//
//
//    });
//
//
//
//});