module.exports = ContentTypeValidator;

function ContentTypeValidator(req, res, next) {

    if(req.header('Content-Type') === 'application/json'){
        next();
    }else{
        res.notAcceptable();
    }

}