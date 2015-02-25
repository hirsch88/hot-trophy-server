module.exports = function (err, req, res, next) {
    if (err instanceof SyntaxError) {
        res.badRequest({message: 'Invalid Json'});
    } else {
        next(err);
    }
};