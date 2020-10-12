var oAuthModule = require( __basedir + '/controllers/modules/oAuthModule');
var accountModule = require( __basedir + '/controllers/modules/accountModule');
var def = require( __basedir + '/controllers/api/apiDefine' );

function init_api_result( path ){
    var api_result = { 
        code : def.code_ok,
        api : path,
        arg : undefined,
        type : undefined,
        data : undefined,
        parent_type : undefined
    };

    return api_result;
}

function init_account_api_result( path ){
    var api_result = { 
        code : def.code_ok,
        api : path,
        arg : '',
        data : ''
    };

    return api_result;
}

exports.error404 = function( req, res ){
    res.render('404');
}

exports.account = function( req, res ){
    var ret = init_account_api_result( req.baseUrl);
    
    accountModule.account( req, ret, function( ret ){
        ret.arg = req.body;
        res.send( ret );
    });
}

exports.new_key_pair = function( req, res ){
    var ret = init_api_result( req.path );
    ret = oAuthModule.new_key_pair( ret, req.body, function(ret){
        ret.arg = req.body;
        return res.send( ret );
    } );
}

exports.get_auth_token_new = function( req, res ){
    var ret = init_api_result( req.path );

    //0. argument check
    if( req.body.app_key == undefined || req.body.app_secret == undefined ||
        req.body.user_id == undefined || req.body.user_pwd == undefined){
        ret.code = def.code_invalid_arg;
        res.send(ret);
    }

    if( req.body.app_key.length == 0 || req.body.app_secret.length == 0 ||
        req.body.user_id.length == 0 || req.body.user_pwd.length == 0){
        ret.code = def.code_invalid_arg;
        res.send(ret);
    }

    //1. key, secret check
    oAuthModule.check_key_pair( ret, req.body, false, function( ret ){
        ret.arg = req.body;
        if( ret.code.code !== def.code_ok.code )
            return res.send( ret );
    
        //2. id, pwd check
        oAuthModule.check_account( ret, req.body, function( ret ){
            if( ret.code.code !== def.code_ok.code )
                return res.send( ret ); 

            //3. generate access, refresh token & save
            oAuthModule.make_tokens( ret, ret.data.client_id, function( ret ){
                if( ret.code.code !== def.code_ok.code )
                    return res.send( ret );
                
                res.send(ret); 
            });
        });
    } );
}

exports.get_auth_token_end = function( req, res ){
    var ret = init_api_result( req.path );

    //0. argument check
    if( req.body.access_token == undefined ){
        ret.code = def.code_invalid_arg;
        res.send(ret);
    }

    //1. clear tokens
    oAuthModule.clear_tokens( ret, req.body.access_token, function( ret ){
        ret.arg = req.body;
        if( ret.code.code !== def.code_ok.code )
            return res.send( ret );

        res.send( ret );
    })
}

exports.get_auth_token_renew = function( req, res){
    var ret = init_api_result( req.path );

    //0. argument check
    if( req.body.app_key == undefined || req.body.app_secret == undefined || req.body.refresh_token == undefined){
        ret.code = def.code_invalid_arg;
        res.send(ret);
    }

    //1. check key pair
    oAuthModule.check_key_pair( ret, req.body, false, function( ret ){
        ret.arg = req.body;
        if( ret.code.code !== def.code_ok.code )
            return res.send( ret );

        //2. check refresh token
        oAuthModule.is_valid_refresh_token( ret, req.body.refresh_token, function(ret){
            if( ret.code.code !== def.code_ok.code )
                return res.send( ret );

            //3. generate access, refresh token & save    
            oAuthModule.make_tokens( ret, ret.data.client_id, function( ret ){
                if( ret.code.code !== def.code_ok.code )
                    return res.send( ret );
                
                return res.send(ret); 
            });
        })
    });
}

exports.get_auth_token_new_app = function( req, res ){
    var ret = init_api_result( req.path );

    //0. argument check
    if( req.body.app_key == undefined || req.body.app_secret == undefined ||
        req.body.parent_access_token == undefined ){
        ret.code = def.code_invalid_arg;
        return res.send( ret );
    }

    //1. valid parent access token check
    oAuthModule.check_key_pair( ret, req.body, true, function( ret ){
        ret.arg = req.body;
        if( ret.code.code !== def.code_ok.code )
            return res.send( ret );

        //2. check refresh token
        oAuthModule.is_valid_access_token( ret, req.body.parent_access_token, function(ret){
            if( ret.code.code !== def.code_ok.code )
                return res.send( ret );
            ret.parent_type = ret.data.type;
            
            //3. generate access, refresh token & save    
            oAuthModule.make_tokens_app( ret, req.body.parent_access_token, function( ret ){
                if( ret.code.code !== def.code_ok.code )
                    return res.send( ret );
                
                return res.send(ret); 
            });
        })
    });
}

exports.get_auth_token_end_app = function( req, res ){
    var ret = init_api_result( req.path );

    //0. argument check
    if( req.body.access_token == undefined ){
        ret.code = def.code_invalid_arg;
        return res.send( ret );
    }

    //1. clear tokens
    oAuthModule.clear_tokens_app( ret, req.body.access_token, function( ret ){
        ret.arg = req.body;
        if( ret.code.code !== def.code_ok.code )
            return res.send( ret );

        return res.send( ret );
    })
}

exports.get_auth_token_renew_app = function( req, res){
    var ret = init_api_result( req.path );

    //0. argument check
    if( req.body.app_key == undefined || req.body.app_secret == undefined || req.body.refresh_token == undefined){
        ret.code = def.code_invalid_arg;
        res.send(ret);
    }

    //1. check key pair
    oAuthModule.check_key_pair( ret, req.body, true, function( ret ){
        ret.arg = req.body;
        if( ret.code.code !== def.code_ok.code )
            return res.send( ret );

        //2. check refresh token
        oAuthModule.is_valid_refresh_token_app( ret, req.body.refresh_token, function(ret){
            if( ret.code.code !== def.code_ok.code )
                return res.send( ret );

            //3. generate access, refresh token & save    
            oAuthModule.make_tokens_app( ret, ret.data.client_id, function( ret ){
                if( ret.code.code !== def.code_ok.code )
                    return res.send( ret );
                
                return res.send(ret); 
            });
        })
    });
}