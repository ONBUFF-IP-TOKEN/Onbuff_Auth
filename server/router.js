const express = require('express');
var render = require('co-views')('views');

module.exports.initRoute = function (app, sessionMgr) {
    const apiController = require(__basedir +'/controllers/api/apiController');
    //const pageController = require(__basedir + '/controllers/pageController');

    const routerPage = express.Router();
    const routerDb = express.Router();

    const routerOauth = express.Router();
    const routerAccount = express.Router();

    /** controller **/
    // //create account
    // routerAccount.post( '/account_create', apiController.account );
    // //check account nick name
    // routerAccount.post( '/account_check_nick_duplicate', apiController.account );
    // //modify account
    // routerAccount.post( '/account_modify', apiController.account );
    // //remove account
    // routerAccount.post( '/account_remove', apiController.account );


    //create app key, secret 
    routerOauth.post( '/new_key_pair', apiController.new_key_pair );
    //login & access token
    routerOauth.post( '/get_auth_token_new', apiController.get_auth_token_new );
    //logout 
    routerOauth.post( '/get_auth_token_end', apiController.get_auth_token_end );
    //renew token
    routerOauth.post( '/get_auth_token_renew', apiController.get_auth_token_renew );
    //3rd app login & access token
    routerOauth.post( '/get_auth_token_new_app', apiController.get_auth_token_new_app );
    //3rd logout
    routerOauth.post( '/get_auth_token_end_app', apiController.get_auth_token_end_app );
    //3rd app renew token
    routerOauth.post( '/get_auth_token_renew_app', apiController.get_auth_token_renew_app );

    app.use( '/api/account/:url', apiController.account );
    app.use( '/api/oauth', routerOauth );

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
};