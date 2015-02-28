var log = require('../lib/logger');

module.exports = ContentTypeValidator;

function ContentTypeValidator(req, res, next) {

    log.info('ContentTypeValidator', 'init');

    if(req.header('Content-Type') === 'application/json'){
        next();
    }else{
        res.notAcceptable();
    }

}