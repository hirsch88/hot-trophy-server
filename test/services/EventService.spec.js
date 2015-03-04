var expect = require("chai").expect;
var assert = require("assert");

var log = require('../../lib/logger');

var EventService = require('../../api/services/EventService');

describe("EventService", function () {

    describe("#getKinds()", function () {
        it('should return an array ', function () {
            expect(EventService.getKinds())
                .to.be.an('array');
        });

        it('length of this array should be greater than 0 ', function () {
            expect(EventService.getKinds())
                .to.have.length.above(0);
        });

    });

    describe("#getModes()", function () {
        it('should return an array ', function () {
            expect(EventService.getModes())
                .to.be.an('array');
        });

        it('length of this array should be greater than 0 ', function () {
            expect(EventService.getModes())
                .to.have.length.above(0);
        });

    });

    describe("#hasValidKind()", function () {

        var kinds = [];
        before(function (done) {
            kinds = EventService.getKinds();
            done();
        });

        it('should return false, when the parameter is emtpy', function () {
            expect(EventService.hasValidKind())
                .to.be.false;

            expect(EventService.hasValidKind(''))
                .to.be.false;

            expect(EventService.hasValidKind(null))
                .to.be.false;

            expect(EventService.hasValidKind(undefined))
                .to.be.false;

            expect(EventService.hasValidKind('aAa'))
                .to.be.false;
        });

        it('should return true, when the parameter set', function () {
            expect(EventService.hasValidKind(kinds[0]))
                .to.be.true;
        });

    });

    describe("#hasValidMode()", function () {

        var modes = [];
        before(function (done) {
            modes = EventService.getModes();
            done();
        });

        it('should return false, when the parameter is emtpy or wrong', function () {
            expect(EventService.hasValidMode())
                .to.be.false;

            expect(EventService.hasValidMode(''))
                .to.be.false;

            expect(EventService.hasValidMode(null))
                .to.be.false;

            expect(EventService.hasValidMode(undefined))
                .to.be.false;

            expect(EventService.hasValidMode('aAa'))
                .to.be.false;
        });

        it('should return true, when the parameter set', function () {
            expect(EventService.hasValidMode(modes[0]))
                .to.be.true;

        });

    });

});