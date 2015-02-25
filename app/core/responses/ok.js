module.exports = function ok(req, res, next) {

    res.ok = function(data){
        res.status(200);
        res.json(data);
    };
    next();

};