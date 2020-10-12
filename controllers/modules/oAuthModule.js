//var pg = require( __basedir + '/controllers/db/db_pg');
var db = require( __basedir + '/controllers/db/db_mysql');
var def = require( __basedir + '/controllers/api/apiDefine' );
var crypto = require( __basedir + '/util/crypto' );
var time = require( __basedir + '/util/time' );

exports.new_key_pair = function( ret, body, callback ){
    //1. make key pair
    var cur_time = time.getTime();
    var pair = crypto.make_key_pair( cur_time + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) );

    //2. save db
    var ret_db = db.set_key_pair( pair.key, pair.secret, body.type, function( db_result ){
        if( db_result.err ){
            ret.code = def.code_fail_new_pair;
        }else if( db_result.data == undefined )
            ret.code = def.code_fail_new_pair;
        else 
            ret.data = pair;

        return callback(ret);
    });
}

exports.check_key_pair = function( ret, body, isApp, callback ){
    //1. db check
    db.check_key_pair( body.app_key, body.app_secret, isApp, function( db_result ){
        if( db_result.err ){
            ret.code = def.code_invalid_pair;
        }
        if( db_result.data == undefined )
            ret.code = def.code_invalid_pair;
        else
            ret.type = db_result.data.type;
        return callback(ret);
    } );
}

exports.check_account = function( ret, body, callback ){
    db.check_account( body.user_id, body.user_pwd, function( db_result ) {
        if( db_result.err ){
            ret.code = def.code_fail_check_account;
        }
        
        if( db_result.data == undefined )
            ret.code = def.code_fail_check_account;
        else 
            ret.data = db_result.data;

        return callback(ret);
    });
}

//access, refresh token create and save
exports.make_tokens = function( ret, client_id, callback ){

    var token_info = [ 
        crypto.make_access_token(), 
        crypto.make_refresh_token(), 
        (new Date().valueOf() + def.def_token_expire_time),
        client_id, 
        ret.type
    ]

        //check exist app info
    db.get_info( token_info, function( db_result ){
        if( db_result.err ){
            ret.code = def.code_fail_not_exist_app_info;
            return callback( ret );
        }        
        else if( db_result.data == undefined ){
            //insert new app info
            db.set_info( token_info, function( db_result ){
                if( db_result.err ){
                    ret.code = def.code_fail_db_insert;
                    return callback( ret );
                }

                db.update_token_info( token_info, function( db_result ){
                    if( db_result.err ){
                        ret.code = def.code_fail_make_tokens;
                    }
                    
                    if( db_result.data == undefined )
                        ret.code = def.code_fail_make_tokens;
                    else{
                        ret.data.access_token = token_info[0];
                        ret.data.refresh_token = token_info[1 ];
                        ret.data.token_expire = token_info[2];
                    }
                    return callback( ret );
                })
            })
        }else if( db_result.data !== undefined ){
            //update app token info
            db.update_token_info( token_info, function( db_result ){
                if( db_result.err ){
                    ret.code = def.code_fail_make_tokens;
                }
                
                if( db_result.data == undefined )
                    ret.code = def.code_fail_make_tokens;
                else{
                    ret.data.access_token = token_info[0];
                    ret.data.refresh_token = token_info[1];
                    ret.data.token_expire = token_info[2];
                }
                return callback( ret );
            })
        }
    });
}

//app access, refresh token create and save
exports.make_tokens_app = function( ret, parent_access_token, callback ){

    var token_info = [ 
        parent_access_token,
        crypto.make_access_token(), 
        crypto.make_refresh_token(), 
        (new Date().valueOf() + def.def_token_expire_time_app),
        ret.data.client_id,
        ret.type,
        ret.parent_type
    ]

    //check exist app info
    db.get_app_info( token_info, function( db_result ){
        if( db_result.err ){
            ret.code = def.code_fail_not_exist_app_info;
            return callback( ret );
        }
        else if( db_result.data == undefined ){
            //insert new app info
            db.set_app_info( token_info, function( db_result ){
                if( db_result.err ){
                    ret.code = def.code_fail_db_insert;
                    return callback( ret );
                }

                db.update_token_info_app( token_info, function( db_result ){
                    if( db_result.err ){
                        ret.code = def.code_fail_make_tokens;
                    }
                    
                    if( db_result.data == undefined )
                        ret.code = def.code_fail_make_tokens;
                    else{
                        ret.data.access_token = token_info[ 1];
                        ret.data.refresh_token = token_info[ 2 ];
                        ret.data.token_expire = token_info[ 3 ];
                    }
                    return callback( ret );
                })
            })
        }else if( db_result.data !== undefined ){
            //update app token info
            db.update_token_info_app( token_info, function( db_result ){
                if( db_result.err ){
                    ret.code = def.code_fail_make_tokens;
                }
                
                if( db_result.data == undefined )
                    ret.code = def.code_fail_make_tokens;
                else{
                    ret.data.access_token = token_info[ 1];
                    ret.data.refresh_token = token_info[ 2 ];
                    ret.data.token_expire = token_info[ 3 ];
                }
                return callback( ret );
            })
        }
    });
}

exports.clear_tokens = function( ret, access_token, callback ){
    db.clear_tokens( access_token, function( db_result ){
        if( db_result.err ){
            ret.code = def.code_fail_invalid_access_token;
        }
        
        if( db_result.data == undefined )
            ret.code = def.code_fail_invalid_access_token;
        else 
            ret.data = db_result.data;

        return callback( ret );
    });
}

//refresh token is valid check.
exports.is_valid_refresh_token = function( ret, refresh_token, callback ){
    db.get_token_info_of_refresh_token( refresh_token, new Date().valueOf(), ret.type, function( db_result ){
        if( db_result.err ){
            ret.code = def.code_fail_invalid_refresh_token;
        }
        
        if( db_result.data == undefined )
            ret.code = def.code_fail_invalid_refresh_token;
        else 
            ret.data = db_result.data;

        return callback( ret );
    });
}

exports.is_valid_refresh_token_app = function( ret, refresh_token, callback ){
    db.get_token_info_of_refresh_token_app( refresh_token, new Date().valueOf(), ret.type, function( db_result ){
        if( db_result.err ){
            ret.code = def.code_fail_invalid_refresh_token;
        }
        
        if( db_result.data == undefined )
            ret.code = def.code_fail_invalid_refresh_token;
        else {
            ret.data = db_result.data;
            ret.parent_type = db_result.data.parent_type;
        }

        return callback( ret );
    });
}

//access token is valid check.
exports.is_valid_access_token = function( ret, access_token, callback ){
    db.get_token_info_of_access_token( access_token, new Date().valueOf(), function( db_result ){
        if( db_result.err ){
            ret.code = def.code_fail_invalid_access_token;
        }
        
        if( db_result.data == undefined )
            ret.code = def.code_fail_invalid_access_token;
        else 
            ret.data = db_result.data;

        return callback( ret );
    });
}

exports.clear_tokens_app = function( ret, access_token, callback ){
    db.clear_tokens_app( access_token, function( db_result ){
        if( db_result.err ){
            ret.code = def.code_fail_invalid_access_token;
        }
        
        if( db_result.data == undefined )
            ret.code = def.code_fail_invalid_access_token;
        else 
            ret.data = db_result.data;

        return callback( ret );
    });
}
