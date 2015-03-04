var mUtil = require('./../../mocha.util.js');

var server = mUtil.server;
var log = mUtil.log;
var config = mUtil.config;

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var request = require('supertest');
var _ = require('underscore');


describe('Unit: Scheduler Liga', function () {

    before(function (done) {
        done();
    });

    describe('POST public/schedule', function () {

        describe('Liga Mode', function () {

            it('Just accepts full body. All required fields', function (done) {

                request(server)
                    .post('/api/public/schedule')
                    .type('json')
                    .send({})
                    .expect(400)
                    .end(function (err) {
                        should.not.exist(err);
                        done();
                    });

            });


            var schedule;
            var teams = [
                {
                    name: 'Hirsch'
                },
                {
                    name: 'Moe'
                },
                {
                    name: 'Beni'
                },
                {
                    name: 'Dave'
                }
            ];
            it('Generate schedule for a LIGA with 4 Teams', function (done) {

                request(server)
                    .post('/api/public/schedule')
                    .type('json')
                    .send({
                        name: 'test-tunier',
                        date: new Date('01.04.2015'),
                        kind: 'FIFA',
                        mode: 'LIGA',
                        teams: teams
                    })
                    .expect(200)
                    .end(function (err, res) {
                        schedule = res.body;
                        should.not.exist(err);
                        done();
                    });

            });

            it('The generated schedule schould have 3 Rounds and 6 Games ', function () {
                expect(schedule.schedule.length).to.equal(6);
            });

        });


        //it('schou', function (done) {
        //
        //    //request(server)
        //    //    .post('/api/auth/register')
        //    //    .type('json')
        //    //    .send(mUtil.getTestUser())
        //    //    .expect(201)
        //    //    .end(function (err) {
        //    //        should.not.exist(err);
        //    //        done();
        //    //    });
        //
        //
        //});
    });
});