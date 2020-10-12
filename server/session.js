var reqHttp = require( __basedir+ '/controllers/requestController');
var configCtrl = require( __basedir + '/controllers/configController');
var io = undefined;

var envData = null;

module.exports.finSession = function() {
    console.log( "finSession" );
    //if( io != undefined )
    //    io.close();
}

module.exports.initSession = function (app, httpServer, logger ) {
    console.log( "initSession" );
    
    io = require('socket.io').listen(httpServer);
    
    var session = require('express-session')({
        secret: 'sg client',
        resave: true,
        saveUninitialized: true
    });

    var sharedsession = require("express-socket.io-session");
    app.use(session);

    io.use(sharedsession(session));

    /*** Socket.IO 추가 ***/
    io.on('connection', function (socket) {
        console.log( "new connection" );
        /** 로비 초기화 **/
        socket.on("login", function (data) {
            logger.info( 'socket : login' );
        });

        socket.on("get_env_info", function() {
            console.log( 'init_env' );
            //console.log( JSON.stringify( configCtrl.get_env_info() ) );
            socket.emit( 'init_env', JSON.stringify( configCtrl.get_env_info() ) );
        });

        /** 접속 해제시 **/
        socket.on('disconnect', function () {
            console.log('socket : disconnect');
            socket.disconnect(true);
        });

        socket.on('v1/api', function (data) {
            var url = data.url;
        });

        socket.on( 'req_api', function( data ){
            var https = false;

            if( data.https == 1 )
                https = true;

            console.log( JSON.stringify( data ) );

            if( data.http_type == undefined || data.http_type == 'post'){
                reqHttp.post_normal( data, function( results ){
                    //console.log( data.pid );
                    socket.emit('res_api', { 'pid' : data.pid, 'values' : JSON.stringify( results ) } );
                }, https );
            }else if( data.http_type == undefined || data.http_type == 'get' ){
                reqHttp.get_normal( data, function( results ){
                    socket.emit( 'res_api', { 'pid' : data.pid, 'values' : JSON.stringify( results ) } );
                }, https);
            }
        });


        socket.on('get_meta_file', function(data){
            reqHttp.get_meta_file( data, function( results ){
                console.log( 'get_meta_file_res' );
                socket.emit( 'get_meta_file_res', results );
            });
        });
    });



    // function getTime() {
    //     var date = new Date();
    //     var time;
    //     if (date.getHours() <= 12) {
    //         time = "오전 " + date.getHours() + ":" + parseMinute(date.getMinutes());
    //     } else {
    //         time = "오후 " + (date.getHours() - 12) + ":" + parseMinute(date.getMinutes());
    //     }
    //     return time;
    // }

    // function parseMinute(minute) {
    //     if (minute < 10) {
    //         return "0" + minute;
    //     } else {
    //         return minute;
    //     }
    // }

    // function makeUrl() {
    //     var text = "";
    //     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    //     for (var i = 0; i < 20; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

    //     return text;
    // }

};