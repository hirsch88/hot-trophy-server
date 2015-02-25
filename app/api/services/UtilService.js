var Promise = require('bluebird');

module.exports = {

    hasRequiredAttributes: function (requiredAttrs, body) {
        var val;
        for (var i = 0; i < requiredAttrs.length; i++) {
            val = body[requiredAttrs[i]];
            if( val === null || val === undefined ){
                return false;
            }
        }
        return true;
    }



};