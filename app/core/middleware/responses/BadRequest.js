module.exports = function badRequest(req, res, next) {

    res.badRequest = function(err){
        res.status(400);
        res.json({
            error: err
        });
    };
    next();

};