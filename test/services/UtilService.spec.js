//var expect = require("chai").expect;
//var assert = require("assert");
//
//var UtilService = require('../../api/services/UtilService');
//
//describe("UtilService", function () {
//    describe("#hasRequiredAttributes()", function () {
//
//        var requiredAttributes = [
//            'keyA'
//        ];
//
//        it('should return true when the body is null as well as the required attributes ', function () {
//            expect(UtilService.hasRequiredAttributes(null, null))
//                .to.equal(true);
//
//            expect(UtilService.hasRequiredAttributes(undefined, undefined))
//                .to.equal(true);
//
//            expect(UtilService.hasRequiredAttributes(null, undefined))
//                .to.equal(true);
//
//            expect(UtilService.hasRequiredAttributes(undefined, null))
//                .to.equal(true);
//
//            expect(UtilService.hasRequiredAttributes([], null))
//                .to.equal(true);
//
//            expect(UtilService.hasRequiredAttributes([], undefined))
//                .to.equal(true);
//
//            expect(UtilService.hasRequiredAttributes([], {}))
//                .to.equal(true);
//
//        });
//
//        it('should return false when the body empty', function () {
//            expect(UtilService.hasRequiredAttributes(requiredAttributes, {}))
//                .to.equal(false);
//
//            expect(UtilService.hasRequiredAttributes(requiredAttributes, undefined))
//                .to.equal(false);
//
//            expect(UtilService.hasRequiredAttributes(requiredAttributes, null))
//                .to.equal(false);
//        });
//
//        it('should return false when the body is set', function () {
//            expect(UtilService.hasRequiredAttributes(requiredAttributes, {keyZ: 'value'}))
//                .to.equal(false);
//
//            expect(UtilService.hasRequiredAttributes(requiredAttributes, {keyZ: 'value', keyA: ''}))
//                .to.equal(false);
//
//            expect(UtilService.hasRequiredAttributes(requiredAttributes, {keyZ: 'value', keyA: undefined}))
//                .to.equal(false);
//
//            expect(UtilService.hasRequiredAttributes(requiredAttributes, {keyZ: 'value', keyA: null}))
//                .to.equal(false);
//
//        });
//
//
//    });
//});