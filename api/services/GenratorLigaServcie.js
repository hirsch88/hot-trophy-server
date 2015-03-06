'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var robin = require('roundrobin');
var log = require('../../lib/logger');
var UtilService = require('../services/UtilService');


module.exports = {
    generator:             Generator,
    hasRequiredAttributes: hasRequiredAttributes
};

/**
 * @name hasRequiredAttributes
 * @description
 * Validates all the required attributes.
 *
 * @param options
 * @returns {bluebird}
 */
function hasRequiredAttributes(options) {
    return new Promise(function (resolve, reject) {

        var requiredAttributes = ['kind', 'mode', 'teams'];
        if (!UtilService.hasRequiredAttributes(requiredAttributes, options)) {
            reject({
                message:  'Required attributes are missing',
                required: requiredAttributes
            });
        } else {

            // check for duplicated team names
            _.each(options.teams, function (team) {
                if (_.where(options.teams, {name: team.name}).length > 1) {
                    return reject({
                        message: 'Duplicated Teams'
                    });
                }
            });

            if (options.teams.length < 3) {
                return reject({
                    message: 'This action needs more teams'
                });
            }

            resolve(options);
        }
    });
}

/**
 * @name Generator
 * @param options
 * @returns {bluebird}
 * @constructor
 */
function Generator(options) {

    // globals
    this.schedule = [];
    this.teams = options.teams || [];
    this.amountPitches = options.amountPitches || (this.teams.length % 2 == 0)
        ? (this.teams.length / 2)
        : ((this.teams.length - 1) / 2);

    this.pitchPointer = 0;
    this.pitches = [];
    for (var n = 0; n < this.amountPitches; n++) {
        this.pitches.push(
            String.fromCharCode(65 + n)
        );
    }

    this.hasReturnLeg = options.returnLeg || false;

    // Build ids for the teams
    for (var i = 0; i < this.teams.length; i++) {
        this.teams[i].hashKey = UtilService.buildHashKey(i + 1);
    }

    this.homeToggle = false;

}

/**
 * @name run
 * @description
 * This is the heart of the generator.
 *
 * @returns {bluebird}
 */
Generator.prototype.run = function () {
    var scope = this;
    return new Promise(function (resolve) {

        var scaffold = robin(scope.teams.length);
        scope.buildFromScaffold(scaffold);
        //[
        //    [ [ 1, 6 ], [ 2, 5 ], [ 3, 4 ] ],
        //    [ [ 1, 5 ], [ 6, 4 ], [ 2, 3 ] ],
        //    [ [ 1, 4 ], [ 5, 3 ], [ 6, 2 ] ],
        //    [ [ 1, 3 ], [ 4, 2 ], [ 5, 6 ] ],
        //    [ [ 1, 2 ], [ 3, 6 ], [ 4, 5 ] ]
        //]

        if (scope.hasReturnLeg) {
            scope.buildReverseSchedule()
        }

        resolve({
            schedule: scope.schedule,
            teams:    scope.teams
        });
    });
};

/**
 * @name buildFromScaffold
 * @description
 * Loops through the generated scaffold
 *
 * @param scaffold
 */
Generator.prototype.buildFromScaffold = function (scaffold) {
    var scope = this;
    for (var r = 0; r < scaffold.length; r++) {
        for (var g = 0; g < scaffold[r].length; g++) {
            scope.addGameToSchedule(scaffold[r][g], r + 1);
        }
    }
};

/**
 * @name addGameToSchedule
 * @description
 * A new clash will added to the schedule, but if one is the team with the id 1
 * than we use the homeToggle boolean to identify the home right
 *
 * @param clash {array}
 * @param round {number}
 */
Generator.prototype.addGameToSchedule = function (clash, round) {

    var home = (this.homeToggle && clash[0] === 1) ? 0 : 1;
    var away = (this.homeToggle && clash[0] === 1) ? 1 : 0;

    this.homeToggle = (clash[0] === 1) ? !this.homeToggle : this.homeToggle;

    this.schedule.push({
        round: round,
        pitch: this.getPitch(),
        home:  {
            team:       UtilService.buildHashKey(clash[home]),
            score:      null,
            scorer:     [],
            yellowCard: [],
            redCard:    []
        },
        away:  {
            team:       UtilService.buildHashKey(clash[away]),
            score:      null,
            scorer:     [],
            yellowCard: [],
            redCard:    []
        }
    });
};

/**
 * @name getPitch
 * @description
 * This returns the pitch letter/key and increments the pointer
 *
 * @returns {string}
 */
Generator.prototype.getPitch = function () {
    var pitch = this.pitches[this.pitchPointer];
    this.pitchPointer = (this.pitchPointer === this.pitches.length - 1)
        ? 0
        : this.pitchPointer + 1;
    return pitch;
};

/**
 * @name buildReverseSchedule
 * @description
 * Mirror the schedule for the return leg
 *
 */
Generator.prototype.buildReverseSchedule = function () {
    var scope = this;
    var reverseSchedule = [];
    for (var i = 0; i < scope.schedule.length; i++) {
        reverseSchedule.push({
            round: scope.schedule[i].round + scope.teams.length - 1,
            pitch: scope.schedule[i].pitch,
            home:  {
                team:       scope.schedule[i].away.team,
                score:      null,
                scorer:     [],
                yellowCard: [],
                redCard:    []
            },
            away:  {
                team:       scope.schedule[i].home.team,
                score:      null,
                scorer:     [],
                yellowCard: [],
                redCard:    []
            }
        });
    }

    _.each(reverseSchedule, function (game) {
        scope.schedule.push(game);
    });

};

