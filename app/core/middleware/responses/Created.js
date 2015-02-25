module.exports = function created(req, res, next) {

    res.created = function(data){
        res.status(201);
        res.json(data);
    };
    next();

};