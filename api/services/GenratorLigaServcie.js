var Promise = require('bluebird');
var log = require('../../lib/logger');

var UtilService = require('../services/UtilService');
var _ = require('underscore');


module.exports = {
    generator:             Generator,
    hasRequiredAttributes: hasRequiredAttributes
};

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

            resolve(options);
        }
    });
}

/**
 *
 * @param options
 * @returns {bluebird}
 * @constructor
 */
function Generator(options) {

    // globals
    this.schedule = [];
    this.amountPitches = options.amountPitches || 1;
    this.hasReturnLeg = options.returnLeg || false;
    this.teams = options.teams || [];

    // Build ids for the teams
    for (var i = 0; i < this.teams.length; i++) {
        this.teams[i].hashKey = UtilService.buildHashKey(i + 1);
    }

    return this;
}

/**
 *
 * @returns {bluebird}
 */
Generator.prototype.run = function () {
    var scope = this;
    var counter = 0;
    return new Promise(function (resolve, reject) {

        // local variables and defaults
        var isHomeToggle = true;

        // build first draw of the schedule
        scope.eachClash(function (primaryTeam, opponentTeam) {

            isHomeToggle = scope.evaluateHomeTeam(primaryTeam, opponentTeam);

            var game = {
                id : ++counter,
                home: {
                    team:  (isHomeToggle) ? primaryTeam.hashKey : opponentTeam.hashKey,
                    score: null
                },
                away: {
                    team:  (!isHomeToggle) ? primaryTeam.hashKey : opponentTeam.hashKey,
                    score: null
                }
            };

            scope.schedule.push(game);
        });


        resolve(scope);
    });
};

/**
 * @name eachClash
 * @description
 * This builds each clash between the teems, but not against himself and also
 * checks for the return-leg option to prohibit a clash that already exists
 *
 * @param iteratee {Function}
 */
Generator.prototype.eachClash = function (iteratee) {
    var scope = this;
    _.each(scope.teams, function (primaryTeam) {
        _.each(
            _.filter(scope.teams, function (element) {
                return element !== primaryTeam
            }),
            function (opponentTeam) {
                if (!scope.hasReturnLeg) {
                    if (!scope.doesClashOfThisTeamsAlreadyExists(primaryTeam, opponentTeam)) {
                        iteratee(primaryTeam, opponentTeam);
                    }
                } else {
                    iteratee(primaryTeam, opponentTeam);
                }
            });
    });
};

/**
 *
 * @param primaryTeam {Object}
 * @param opponentTeam {Object}
 * @returns {boolean}
 */
Generator.prototype.doesClashOfThisTeamsAlreadyExists = function (primaryTeam, opponentTeam) {
    var scope = this;
    return _.find(scope.schedule, function (game) {
            return (game.home.team === primaryTeam.hashKey && game.away.team === opponentTeam.hashKey)
                || (game.home.team === opponentTeam.hashKey && game.away.team === primaryTeam.hashKey);
        }) !== undefined;
};


/**
 * @name evaluateHomeTeam
 * @description
 * Todo
 *
 * @param primaryTeam {Object}
 * @param opponentTeam {Object}
 * @returns {boolean}
 */
Generator.prototype.evaluateHomeTeam = function (primaryTeam, opponentTeam) {
    var scope = this;

    var resultAmountGames = _.countBy(scope.schedule, function (game) {
        if (game.home.team === primaryTeam.hashKey) {
            return 'primaryHome';
        }
        if (game.away.team === primaryTeam.hashKey) {
            return 'primaryAway';
        }

        if (game.home.team === opponentTeam.hashKey) {
            return 'opponentHome';
        }
        if (game.away.team === opponentTeam.hashKey) {
            return 'opponentAway';
        }

        return 'none';
    });

    resultAmountGames.primaryHome = resultAmountGames.primaryHome || 0;
    resultAmountGames.primaryAway = resultAmountGames.primaryAway || 0;
    resultAmountGames.opponentHome = resultAmountGames.opponentHome || 0;
    resultAmountGames.opponentAway = resultAmountGames.opponentAway || 0;


    var resultAmountGamesPrimaryTeam = _.countBy(scope.schedule, function (game) {
        return (game.home.team === primaryTeam.hashKey) || (game.away.team === primaryTeam.hashKey);
    }).true;

    var resultAmountGamesOponentTeam = _.countBy(scope.schedule, function (game) {
        return (game.home.team === opponentTeam.hashKey) || (game.away.team === opponentTeam.hashKey);
    }).true;

    var amountGamesPerTeam = (scope.hasReturnLeg)
        ? (scope.teams.length - 1) * 2
        : (scope.teams.length - 1);


    var even = (scope.teams.length) % 2 !== 0;
    var maxHomeCounter = (even) ? ((scope.teams.length - 1) / 2) : ((scope.teams.length) / 2);
    var maxAwayCounter = (even) ? maxHomeCounter : ((scope.teams.length) / 2);


    if (maxHomeCounter === resultAmountGames.primaryHome) {
        return false;
    }

    if (maxAwayCounter === resultAmountGames.primaryAway) {
        return true;
    }


    return resultAmountGames.primaryHome < resultAmountGames.opponentHome;

};




