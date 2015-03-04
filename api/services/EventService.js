var Promise = require('bluebird');
var log = require('../../lib/logger');



var EventService = {

    getKinds: function () {
        return [
            'SOCCER',
            'FIFA'
        ];
    },

    getModes: function () {
        return [
            'LIGA',
            'KO',
            'GROUPS/KO'
        ];
    },

    hasValidKind: function (kind) {
        return this.getKinds().indexOf(kind) !== -1;
    },

    hasValidMode: function (mode) {
        return this.getModes().indexOf(mode) !== -1;
    },

};

module.exports = EventService;