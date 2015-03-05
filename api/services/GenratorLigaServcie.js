'use strict';

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

    this.hasReturnLeg = options.returnLeg || false;

    // Build ids for the teams
    for (var i = 0; i < this.teams.length; i++) {
        this.teams[i].hashKey = UtilService.buildHashKey(i + 1);
    }

    return this;
}

/**
 * @name run
 * @description
 * Todo
 *
 * @returns {bluebird}
 */
Generator.prototype.run = function () {
    var scope = this;
    return new Promise(function (resolve) {

        // build first draw of the schedule
        scope.generateClashes();

        // sorts the schedule and adds id's ,rounds and pitches
        scope.sort();

        // end
        resolve(scope);

    });
};

/**
 * @name generateClashes
 * @description
 * generate all clashes. Moreover this method check home privilege of a teams as well as the option
 * return leg to have just one clash between two teams
 */
Generator.prototype.generateClashes = function () {
    var scope = this;

    // local variables and defaults
    var isHomeToggle = true;

    scope.eachClash(function (primaryTeam, opponentTeam) {
        isHomeToggle = scope.evaluateHomeTeam(primaryTeam, opponentTeam);
        var game = {
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
};

/**
 * @name sort
 * @description
 * Todo
 */
Generator.prototype.sort = function () {
    var scope = this;
    var sorter = new Sorter(scope.schedule, scope.amountPitches);
    scope.schedule = sorter.run();
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


/**
 * @name Sorter
 * @param pot
 * @constructor
 */
function Sorter(pot, pitches) {
    this.gamePot = pot;
    this.pitches = pitches;

    this.schedule = [];

    this.indexCounter = 1;
    this.roundCounter = 0;
}

/**
 * @name run
 */
Sorter.prototype.run = function () {
    var scope = this;

    while (scope.gamePot.length !== 0) {
        console.log('--------------------------------------------------------------------------------');
        log.info('Gamepot', scope.gamePot.length);
        scope.buildRound()
    }

    return scope.schedule;
};

/**
 * @name buildRound
 */
Sorter.prototype.buildRound = function () {
    var scope = this;

    scope.roundCounter++;
    log.info('Round', scope.roundCounter);

    for (var g = 0; g < scope.pitches; g++) {
        log.info('Game', g);
        var gameIndex = scope.findNextDifferentGame();

        if(gameIndex !== -1){
            scope.add(gameIndex);
        }else{
            scope.add(0);
        }
    }


};

/**
 * @name add
 * @param index
 */
Sorter.prototype.add = function (index) {
    log.info('add', index);
    var scope = this;
    index = (index) ? index : 0;

    scope.gamePot[index].id = scope.indexCounter++;
    scope.gamePot[index].round = scope.roundCounter;

    scope.schedule.push(scope.gamePot[index]);
    scope.gamePot.splice(index, 1);
    scope.gamePot = scope.rebuildArray(scope.gamePot);

};

/**
 * @name next
 */
Sorter.prototype.next = function () {


};

/**
 * @name findNextDifferentGame
 */
Sorter.prototype.findNextDifferentGame = function (index) {

    // TODO check round amount to fit. get teams that didnt play the round before

    index = index || 0;
    var scope = this;
    var gamesInTheCurrentRound = _.where(scope.schedule, {
        round: scope.roundCounter
    });

    // First run just returns the first clash
    if (gamesInTheCurrentRound.length === 0) {
        return 0;
    }

    // find a different game
    var diffrentGames = _.filter(scope.gamePot, function (game) {
        return !scope.hasTeam(gamesInTheCurrentRound, game);
    });

    return _.indexOf(scope.gamePot, diffrentGames[index]);

};

/**
 * @name next
 */
Sorter.prototype.hasTeam = function (pot, game) {
    var result = _.find(pot, function (clash) {
        return (clash.home.team === game.home.team ) || (clash.home.team === game.away.team )
            || (clash.away.team === game.home.team ) || (clash.away.team === game.away.team );
    });

    return result !== undefined;
};

///**
// * @name next
// */
//Sorter.prototype.hasClash = function (pot, game) {
//    var result = _.find(pot, function (clash) {
//        return (clash.home.team === game.home.team && clash.away.team === game.away.team);
//    });
//
//    return result !== undefined;
//};

/**
 * @name rebuildArray
 * @param a
 * @returns {Array}
 */
Sorter.prototype.rebuildArray = function (a) {
    var n = [], c = 0;
    for (var i in a) {
        n[c++] = a[i];
    }
    return n;
};

