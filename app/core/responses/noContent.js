module.exports = function noContent(req, res, next) {

    res.noContent = function(){
        res.status(204);
        res.send();
    };
    next();

};