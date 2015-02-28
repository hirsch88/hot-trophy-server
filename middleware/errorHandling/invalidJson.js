var log = require('../../lib/logger');

module.exports = function (err, req, res, next) {
    if (err instanceof SyntaxError) {
        res.status(400);
        res.send('malformed json');
    } else {
        next(err);
    }
};