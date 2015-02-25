var Promise = require('bluebird');

module.exports = {

    hasRequiredAttributes: function (requiredAttrs, body) {
        if(requiredAttrs === undefined || requiredAttrs === null){
            return true;
        }

        if(requiredAttrs.length > 0 && (body === undefined || body === null)){
            return false;
        }

        var val;
        for (var i = 0; i < requiredAttrs.length; i++) {
            val = body[requiredAttrs[i]];
            if (val === null || val === undefined || val === '') {
                return false;
            }
        }
        return true;

    }


};