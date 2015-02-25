module.exports = function serverError(req, res, next) {

    res.serverError = function(err){
        res.status(500);
        res.json({
            error: err
        });
    };
    next();

};