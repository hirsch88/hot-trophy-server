// api/controllers/Schedule.js

var Promise = require('bluebird');
var log = require('../../lib/logger');

var Event = require('../models/EventModel');
var EventService = require('../services/EventService');
var UtilService = require('../services/UtilService');

var GeneratorLiga = require('./../services/GenratorLigaServcie');

var ScheduleController = {

    /**
     *
     * @example
     * {
     *  "kind":             "Liga",
     *  "hasRetrunLeg":     false,
     *  "":"",
     *  "teams":            [],
     *
     * }
     *
     * @param req
     * @param res
     */
    generate: function (req, res) {

        req.body.date = req.body.date || new Date();

        var requiredAttributes = ['kind', 'mode', 'teams'];
        if (!UtilService.hasRequiredAttributes(requiredAttributes, req.body)) {
            return res.badRequest({
                message:  'Required attributes are missing',
                required: requiredAttributes
            });
        }

        req.body.kind = req.body.kind.toUpperCase();
        if (!EventService.hasValidKind(req.body.kind)) {
            return res.badRequest({
                message:  'Wrong tournament kind',
                kinds: EventService.getKinds()
            });
        }

        req.body.mode = req.body.mode.toUpperCase();
        if (!EventService.hasValidMode(req.body.mode)) {
            return res.badRequest({
                message:  'Wrong tournament mode',
                modes: EventService.getModes()
            });
        }

        var service, generator;
        switch (req.body.mode){
            case 'LIGA':
                service = GeneratorLiga;
                break;

        }

        if(!service){
            return res.badRequest({
                message:  'Generator not found'
            })
        }

        service.hasRequiredAttributes(req.body)
            .then(function (result) {
                generator = new service.generator(result);
                return generator.run();

            })
            .then(function (result) {

                res.ok(result);
            })
            .catch(function (err) {
                return res.badRequest(err);
            });

    }

};

module.exports = ScheduleController;
