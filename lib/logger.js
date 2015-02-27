var colors = require('colors');

module.exports.info = function(where, message){
    console.log('[info]'.blue + buildMessage(where, message));
};

module.exports.error = function(where, message){
    console.log('[error]'.red + buildMessage(where, message));
};

module.exports.success = function(where, message){
    console.log('[ ✔ ]'.green + buildMessage(where, message));
};

module.exports.warn = function(where, message){
    console.log('[warn]'.yellow + buildMessage(where, message));
};

module.exports.divide = function(){
    console.log('');
    console.log('--------------------------------------------------------------------------------');
};

function buildMessage(where, message){
    return ' ' + where + ' - ' + message;
}