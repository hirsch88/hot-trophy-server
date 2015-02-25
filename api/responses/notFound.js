module.exports = function notFound(req, res, next) {

    res.notFound = function(){
        res.status(404);
        res.send();
    };
    next();

};