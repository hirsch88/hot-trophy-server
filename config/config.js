var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
    development: {
        root: rootPath,
        app: {
            name: 'hot-trophy'
        },
        port: 2002,
        db: 'mongodb://localhost/hot-trophy'
    },

    test: {
        root: rootPath,
        app: {
            name: 'hot-trophy'
        },
        port: 2002,
        db: 'mongodb://localhost/hot-trophy-test'
    },

    production: {
        root: rootPath,
        app: {
            name: 'hot-trophy'
        },
        port: 2002,
        db: 'mongodb://localhost/hot-trophy-production'
    }
};

module.exports = config[env];
