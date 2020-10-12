var fs = require('fs');
var express = require('express');
var app = express();
var path = require('path');
var log4js = require('log4js');
log4js.configure({
    appenders : { system:{ type : 'console'} },
    categories: { default : { appenders:['system'], level:'error'}}
  });
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var url = require('url');
var httpsOptions = {
    key : fs.readFileSync(global.__basedir  + '/cert/key.pem'),
    cert : fs.readFileSync( global.__basedir + '/cert/cert.pem')
};
var https = require('https').createServer(httpsOptions, app);
var http = require('http').createServer(app);
const logger = log4js.getLogger('system');

var swagger = require( '../swagger/swagger' );
var sessionMgr = require('./session');
var router = require('./router');



module.exports.initServer = function () {
    // view engine setup
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'ejs');
    app.engine('.html', require('jade').renderFile);
    //app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.static(path.join(__dirname, '../views')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    // app.oauth = require('./oauth').GetOAuth2Server();
    // app.use(app.oauth.authorize());

    app.set("ipaddr", "127.0.0.1");
    app.set("port", 443);
    app.set("httpport", 54321);
    
    swagger.initSwagger(app);
    sessionMgr.initSession(app, https, logger );
    router.initRoute(app, sessionMgr);

    var httpsServer = https.listen(app.get('port'), function () {
        console.log("Express server listening on port " + app.get('port'));
        logger.info( "server running on port " + app.get('port'));
    });

    var httpServer = http.listen(app.get('httpport'), function () {
        console.log("Express server listening on port " + app.get('httpport'));
        logger.info( "server running on port " + app.get('httpport'));
    });

    module.exports = app;
};

module.exports.closeServer = function() {
    console.log('closeServer');
    if( http != undefined )
        http.close();

    if( sessionMgr != undefined )
        sessionMgr.finSession();
};