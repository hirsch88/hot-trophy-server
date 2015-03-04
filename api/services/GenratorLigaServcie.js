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
    return new Promise(function (resolve, reject) {

        // local variables and defaults
        var isHomeToggle = true;

        // build first draw of the schedule
        scope.eachClash(function (primaryTeam, opponentTeam) {

            isHomeToggle = scope.evaluateHomeTeam(primaryTeam, opponentTeam);

            var game = {
                home: (isHomeToggle) ? primaryTeam.hashKey : opponentTeam.hashKey,
                away: (!isHomeToggle) ? primaryTeam.hashKey : opponentTeam.hashKey
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
            return (game.home === primaryTeam.hashKey && game.away === opponentTeam.hashKey)
                || (game.home === opponentTeam.hashKey && game.away === primaryTeam.hashKey);
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

    var resultAmountHomeGames = _.countBy(scope.schedule, function (game) {
        if (game.home === primaryTeam.hashKey) {
            return 'primary';
        }

        if (game.home === opponentTeam.hashKey) {
            return 'opponent';
        }

        return 'none';
    });

    resultAmountHomeGames.primary = resultAmountHomeGames.primary || 0;
    resultAmountHomeGames.opponent = resultAmountHomeGames.opponent || 0;


    var resultAmountGamesPrimaryTeam = _.countBy(scope.schedule, function (game) {
        return (game.home === primaryTeam.hashKey) || (game.away === primaryTeam.hashKey);
    }).true;

    var resultAmountGamesOponentTeam = _.countBy(scope.schedule, function (game) {
        return (game.home === opponentTeam.hashKey) || (game.away === opponentTeam.hashKey);
    }).true;

    var amountGamesPerTeam = (scope.hasReturnLeg)
        ? (scope.teams.length - 1) * 2
        : (scope.teams.length - 1);

    //console.log('-----------------');
    //console.log(scope.hasReturnLeg);
    //console.log(amountGamesPerTeam);
    //console.log(resultAmountGamesPrimaryTeam);
    //console.log(resultAmountGamesOponentTeam);


    return resultAmountHomeGames.primary <= resultAmountHomeGames.opponent;

};




