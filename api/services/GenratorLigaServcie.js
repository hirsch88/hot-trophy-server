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

        // if the amount of teams is not even then we will add a dummy team to generate a schedule
        if (scope.teams.length % 2 !== 0 && scope.teams.length > 4) {
            //log.warn('AddDummy');
            scope.addDummyTeam();
            scope.amountPitches++;
        }

        // build first draw of the schedule
        scope.generateClashes();

        // sorts the schedule and adds id's ,rounds and pitches
        scope.sortSchedule();

        // if there is a dummy team remove all clashes and also from the team collection
        if (scope.hasDummyTeam()) {
            //log.warn('HasDummy');
            scope.disappearDummyTeam()
        }

        // For test
        scope.checkRoundsForDuplicates();

        // end
        resolve(scope);

    });
};

/**
 * @name checkRoundsForDuplicates
 */
Generator.prototype.checkRoundsForDuplicates = function () {
    var scope = this;
    for (var round = 1; round <= scope.getAmountRounds(); round++) {

        var list = _.filter(scope.schedule, function (game) {
            return game.round == round;
        });

        var result = {};
        _.each(list, function (game) {
            result[game.home.team] = 0;
            result[game.away.team] = 0;
        });

        var hasDuplicity = false;
        _.each(list, function (game) {
            result[game.home.team]++;
            result[game.away.team]++;

            if (result[game.home.team] > 1 || result[game.away.team] > 1) {
                hasDuplicity = true;
            }
        });

        if (hasDuplicity) {
            log.warn('hasDuplicity', round, result);
        }
    }
};

/**
 * @name getAmountRounds
 * @returns {number}
 */
Generator.prototype.getAmountRounds = function () {

    return this.schedule[this.schedule.length - 1].round;

    //log.info('getAmountRounds', this.schedule.length);
    //log.info('getAmountRounds', this.amountPitches);
    //return this.schedule.length / this.amountPitches;
};


/**
 * @name hasDummyTeam
 * @returns {boolean}
 */
Generator.prototype.hasDummyTeam = function () {
    var scope = this;
    return _.findWhere(scope.teams, {hashKey: '??'}) !== undefined;
};

/**
 * @name disappearDummyTeam
 * @description
 * This removes all clashes of the dummy team to get a correct schedule for the not even amount of teams
 */
Generator.prototype.disappearDummyTeam = function () {
    var scope = this;

    // remove all clashes
    scope.schedule = _.filter(scope.schedule, function (clash) {
        return (clash.home.team !== '??') && (clash.away.team !== '??');
    });

    // remove from team collection
    scope.teams = _.filter(scope.teams, function (team) {
        return team.hashKey !== '??';
    });
};

/**
 * @name addDummyTeam
 * @description
 * This method adds a dummyteam to the not even amount of teams to get a even amount. This helps
 * us to generate the schedule, but at the end we will remove the clashes of this team
 */
Generator.prototype.addDummyTeam = function () {
    this.teams.push({
        hashKey: '??',
        name:    '?HtDummyTeam?'
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
 * @name sortSchedule
 * @description
 * Todo
 */
Generator.prototype.sortSchedule = function () {
    var scope = this;
    var sorter = new Sorter(scope.schedule, scope.amountPitches, scope.teams);
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
function Sorter(pot, pitches, teams) {
    this.gamePot = pot;
    this.pitches = pitches;
    this.teams = teams;

    this.schedule = [];
    this.pointer = 0;

    this.indexCounter = 1;
    this.roundCounter = 0;
}

//Sorter.prototype.getAmountRounds = function () {
//    return this.gamePot.length / this.pitches;
//};

/**
 * @name run
 */
Sorter.prototype.run = function () {
    var scope = this;
    //console.log('--------------------------------------------------------------------------------');
    //log.info('Pitches', scope.pitches);
    //log.info('Gamepot', scope.gamePot.length);
    //console.log('--------------------------------------------------------------------------------');

    while (scope.gamePot.length !== 0) {
        scope.buildRound();
    }

    return scope.schedule;

};

/**
 * @name add
 * @param index
 */
Sorter.prototype.add = function (index) {
    var scope = this;
    index = index || 0;

    scope.gamePot[index].id = scope.indexCounter++;
    scope.gamePot[index].round = scope.roundCounter;

    scope.schedule.push(scope.gamePot[index]);
    scope.gamePot.splice(index, 1);
    scope.gamePot = scope.rebuildArray(scope.gamePot);

};

/**
 * @name buildRound
 */
Sorter.prototype.buildRound = function () {
    var scope = this;

    scope.roundCounter++;
    //log.info('Round', scope.roundCounter);

    scope.add(scope.gamePot.length - 1);
    var finder = scope.getGameFinder();
    finder.refresh();

    var pitchesCounter = scope.pitches - 1;
    while (pitchesCounter !== 0) {

        var gameIndex = finder.next();
        scope.add(gameIndex);
        finder.refresh();
        pitchesCounter--;

    }

};

/**
 * @name getGameFinder
 * @returns {GameFinder}
 */
Sorter.prototype.getGameFinder = function () {
    var scope = this;

    var GameFinder = function GameFinder() {
        this.list = [];
        this.lastRoundList = [];
        this.pointer = 0;
    };

    GameFinder.prototype.next = function () {
        this.pointer = 0;

        // Gets the a clash with the team that played at least
        if (scope.roundCounter > 1) {
            var teams = [];

            // Generates a team array, but without the dummy
            _.each(scope.teams, function (team) {
                if (team.hashKey !== '??') {
                    teams.push({
                        hashKey: team.hashKey,
                        counter: 0
                    });
                }
            });

            // Counts the amount of plays
            _.each(scope.schedule, function (game) {
                teams = _.map(teams, function (team) {
                    if (game.home.team !== '??' && game.away.team !== '??') {
                        team.counter = (game.home.team === team.hashKey || game.away.team === team.hashKey)
                            ? (team.counter + 1)
                            : team.counter;
                    }
                    return team;
                });
            });

            // Gets the team with the minimum of plays
            var teamWithWhoPlayedAtLeast = _.min(teams, function (team) {
                return team.counter;
            });

            // Finds a game with this team
            var game = _.find(this.list, function (game) {
                return game.home.team === teamWithWhoPlayedAtLeast.hashKey
                    || game.away.team === teamWithWhoPlayedAtLeast.hashKey;
            });

            // Gets the index of this game
            this.pointer = _.indexOf(this.list, game);

        }

        var index = _.indexOf(scope.gamePot, this.list[this.pointer]);
        return (index >= 0)
            ? index
            : 0;
    };

    GameFinder.prototype.refresh = function () {
        var listOfGamesInTheCurrentRound = _.where(scope.schedule, {
            round: scope.roundCounter
        });

        listOfGamesInTheCurrentRound = _.filter(listOfGamesInTheCurrentRound, function (game) {
            return (game.home.team !== '??' && game.away.team !== '??' );
        });

        this.list = _.filter(scope.gamePot, function (game) {
            return !scope.hasTeam(listOfGamesInTheCurrentRound, game);
        });

    };

    return new GameFinder;

};

/**
 * @name hasTeam
 * @param pot
 * @param game
 * @returns {boolean}
 */
Sorter.prototype.hasTeam = function (pot, game) {
    var result = _.find(pot, function (clash) {
        return (clash.home.team === game.home.team ) || (clash.home.team === game.away.team )
            || (clash.away.team === game.home.team ) || (clash.away.team === game.away.team );
    });

    return result !== undefined;
};

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

