var expect = require("chai").expect;
var assert = require("assert");
var Promise = require('bluebird');
var _ = require('underscore');

var log = require('../../lib/logger');

var GenratorLigaServcie = require('../../api/services/GenratorLigaServcie');

var TEAMS = [
    {
        "name": "Hirsch"
    },
    {
        "name": "Moe"
    },
    {
        "name": "Beni"
    },
    {
        "name": "Horst"
    },
    {
        "name": "Bubu"
    },
    {
        "name": "Susi"
    },
    {
        "name": "Evian"
    },
    {
        "name": "Xavier"
    },
    {
        "name": "Julius"
    },
    {
        "name": "Kathrin"
    },
    {
        "name": "Norbert"
    },
    {
        "name": "Ueli"
    },
    {
        "name": "Igor"
    },
    {
        "name": "Walter"
    },
    {
        "name": "Ernst"
    },
    {
        "name": "Rudolf"
    },
    {
        "name": "Pascal"
    },
    {
        "name": "Olga"
    },
    {
        "name": "Vladimir"
    },
    {
        "name": "Andreas"
    }
];

describe("Unit: GenratorLigaServcie", function () {

    var options, Generator;

    before(function (done) {

        options = {
            "kind":      "FIFA",
            "mode":      "LIGA",
            "name":      "test",
            "returnLeg": true,
            "date":      1420326000000,
            "teams":     [
                TEAMS[0],
                TEAMS[1],
                TEAMS[2],
                TEAMS[3]
            ]
        };

        done();
    });


    describe('#hasRequiredAttributes()', function () {

        it('should fail because of missing options', function (done) {

            function response(result) {
                expect(result).to.be.a('object');
                expect(result).to.have.property('message');
                expect(result).to.have.property('required');
                done();
            }

            GenratorLigaServcie.hasRequiredAttributes()
                .then(response)
                .catch(response);

        });

        it('should fail because of duplicated team names', function (done) {

            function response(result) {
                expect(result).to.be.a('object');
                expect(result).to.have.property('message');
                done();
            }

            GenratorLigaServcie.hasRequiredAttributes({
                "kind":      "FIFA",
                "mode":      "LIGA",
                "name":      "test",
                "returnLeg": true,
                "date":      1420326000000,
                "teams":     [
                    {
                        "name": "Hirsch"
                    },
                    {
                        "name": "Moe"
                    },
                    {
                        "name": "Beni"
                    },
                    {
                        "name": "Beni"
                    }
                ]
            })
                .then(response)
                .catch(response);

        });

        it('should work and returns the options object', function (done) {

            function response(result) {
                expect(result).to.be.a('object');
                expect(result).to.have.property('kind');
                expect(result).to.have.property('mode');
                expect(result).to.have.property('name');
                expect(result).to.have.property('teams');
                done();
            }

            GenratorLigaServcie.hasRequiredAttributes({
                "kind":      "FIFA",
                "mode":      "LIGA",
                "name":      "test",
                "returnLeg": true,
                "date":      1420326000000,
                "teams":     [
                    {
                        "name": "Hirsch"
                    },
                    {
                        "name": "Moe"
                    },
                    {
                        "name": "Beni"
                    }
                ]
            })
                .then(response)
                .catch(response);
        });

    });


    describe('Generator', function () {

        before(function () {
            Generator = new GenratorLigaServcie.generator(options);
        });

        describe('#init - constructor', function () {
            it('should have some new attributes', function () {
                expect(Generator)
                    .to.have.property('schedule');
                expect(Generator)
                    .to.have.property('teams');
                expect(Generator.teams)
                    .to.have.length.above(2);
                expect(Generator.teams[0])
                    .to.have.property('hashKey');
            });
        });


        describe('#run', function () {

            var events = [];
            before(function (done) {
                var promises = [];

                for (var i = 2; i < 20; i++) {

                    var teams = [];
                    for (var n = 0; n <= i; n++) {
                        teams.push(TEAMS[n]);
                    }

                    var Generator = new GenratorLigaServcie.generator({
                        "kind":      "FIFA",
                        "mode":      "LIGA",
                        "name":      "test",
                        "returnLeg": false,
                        "date":      1420326000000,
                        "teams":     teams
                    });
                    promises.push(Generator.run());
                }

                Promise.settle(promises)
                    .then(function (results) {
                        events = results;
                        done();
                    });

            });


            it(' events should have the correct amount of games', function () {
                var amountGames = [3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91, 105, 120, 136, 153, 171, 190];

                for (var i = 0; i < events.length; i++) {
                    expect(events[i].value().teams)
                        .to.have.length(i + 3);
                    expect(events[i].value().schedule)
                        .to.have.length(amountGames[i]);
                }

            });

            it(' each team should have the same amount of games ', function () {
                for (var i = 0; i < events.length; i++) {
                    _.each(events[i].value().teams, function (team) {
                        var result = _.countBy(events[i].value().schedule, function (game) {
                            return (game.home === team.hashKey) || (game.away === team.hashKey);
                        }).true;

                        if(result !== (events[i].value().teams.length - 1)){
                            log.warn('event', i);
                            log.warn('team', team.hashKey);
                        }

                        expect(result)
                            .to.equal(events[i].value().teams.length - 1);
                    });
                }
            });


            it(' each team should have the same amount of home games ', function () {
                for (var i = 0; i < events.length; i++) {
                    _.each(events[i].value().teams, function (team) {
                        var result = _.countBy(events[i].value().schedule, function (game) {
                            return (game.home === team.hashKey) ? 'home' : (game.away === team.hashKey) ? 'away' : 'none';
                        });

                        var diff = result.home - result.away;
                        if(events[i].value().teams.length % 2 === 0 ){
                            var bol = ( -2 < diff || diff < 2 );

                            if(!bol){
                                log.warn('event', i);
                                log.warn('team', team.hashKey);
                            }

                            expect(bol)
                                .to.be.true;

                        }else{
                            if(diff !== 0){
                                log.warn('event', i);
                                log.warn('team', team.hashKey);
                            }

                            expect(diff)
                                .to.equal(0);
                        }


                    });
                }
            });


        });

    });

});