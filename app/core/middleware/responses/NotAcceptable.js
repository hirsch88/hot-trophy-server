module.exports = function notAcceptable(req, res, next) {

    res.notAcceptable = function () {
        res.status(406);
        res.send();
    };
    next();

};