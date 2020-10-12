global.__basedir = __dirname;

const path = require('path')

var mainWindow = null;

//SERVER INI
var server = require('./server/baseServer')
server.initServer();
