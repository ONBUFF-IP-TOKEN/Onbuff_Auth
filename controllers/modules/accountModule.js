//var db = require( __basedir + '/controllers/db/db_pg');
var db = require( __basedir + '/controllers/db/db_mysql');
var def = require( __basedir + '/controllers/api/apiDefine' );
var crypto = require( __basedir + '/util/crypto' );
var time = require( __basedir + '/util/time' );

exports.account = function( req, ret, callback ){
    if( req.params.url == 'create' ){
        create( req.body, ret, function( ret ) {
            return callback( ret );
        });
    }else if( req.params.url == 'check_nick_duplicate' ){
        check_nick_duplicate( req.body, ret, function( ret ){
            return callback( ret );
        });
    }else if( req.params.url == 'update' ){
        update( req.body, ret, function( ret ){
            return callback( ret );
        });
    }else if( req.params.url == 'remove' ){
        remove( req.body, ret, function( ret ){
            return callback( ret );
        });
    }
}

function create( info, ret, callback ){
    if( info.user_id == undefined || info.user_pwd == undefined || info.birthday == undefined ||
        info.user_nick == undefined || info.user_phone_num == undefined || info.user_sex == undefined ){
        ret.code = def.code_fail_account_create_invalid_arg;
        return callback( ret );
    }
    
    if( info.user_id.length == 0 || info.user_pwd.length == 0 || info.birthday.length == 0 ||
        info.user_nick.length == 0 || info.user_phone_num.length == 0 || info.user_sex.length == 0 ){
        ret.code = def.code_fail_account_create_invalid_arg;
        return callback( ret );
    }

    //1. user id duplicate check
    db.account_duplicate_check_user_id( info, function( db_result ){
        if( db_result.err != undefined && db_result.err != 'duplicate' ){
            ret.code = def.code_error_db;
            return callback( ret );
        }else if( db_result.err == 'duplicate'){
            ret.code = def.code_duplicate_user_id;
            return callback( ret );
        }
        //2. user_nick duplicate check
        db.account_duplicate_check_user_nick( info, false, function( db_result ){
            if( db_result.err != undefined && db_result.err != 'duplicate' ){
                ret.code = def.code_error_db;
                return callback( ret );
            }else if( db_result.err == 'duplicate'){
                ret.code = def.code_duplicate_user_nick;
                return callback( ret );
            }
            
            //3. create user info
            db.account_create( info, function( db_result ){
                if( db_result.err ){
                    ret.code = def.code_fail_new_pair;
                    return callback( ret );
                }
                if( db_result.data != undefined )
                    ret.data = db_result.data;
                return callback( ret );
            });
        })
    });
}

function check_nick_duplicate( info, ret, callback ){
    if( info.user_nick == undefined ){
        ret.code = def.code_fail_account_create_invalid_arg;
        return callback( ret );
    }
    if( info.user_nick.length == 0 ){
        ret.code = def.code_fail_account_create_invalid_arg;
        return callback( ret );
    }
    db.account_duplicate_check_user_nick( info, false, function( db_result ){
        if( db_result.err != undefined && db_result.err != 'duplicate' ){
            ret.code = def.code_error_db;
            return callback( ret );
        }else if( db_result.err == 'duplicate'){
            ret.code = def.code_duplicate_user_nick;
            return callback( ret );
        }
        return callback( ret );
    });
}

function update( info, ret, callback ){
    if( info.user_id == undefined || info.user_pwd == undefined || info.birthday == undefined ||
        info.user_nick == undefined || info.user_phone_num == undefined || info.user_sex == undefined ){
        ret.code = def.code_fail_account_update_invalid_arg;
        return callback( ret );
    }
    
    if( info.user_id.length == 0 || info.user_pwd.length == 0 || info.birthday.length == 0 ||
        info.user_nick.length == 0 || info.user_phone_num.length == 0 || info.user_sex.length == 0 ){
        ret.code = def.code_fail_account_update_invalid_arg;
        return callback( ret );
    }

    //2. user_nick duplicate check
    db.account_duplicate_check_user_nick( info, true, function( db_result ){
        if( db_result.err != undefined && db_result.err != 'duplicate' ){
            ret.code = def.code_error_db;
            return callback( ret );
        }else if( db_result.err == 'duplicate'){
            ret.code = def.code_duplicate_user_nick;
            return callback( ret );
        }
        
        //3. create user info
        db.update( info, function( db_result ){
            if( db_result.err ){
                ret.code = def.code_fail_new_pair;
                return callback( ret );
            }
            else if( db_result.data == undefined ){
                ret.code = def.code_invalid_user_id;
                return callback( ret );
            }
            if( db_result.data != undefined )
                ret.data = db_result.data;
            return callback( ret );
        });
    })
}

function remove( info, ret, callback ){
    if( info.user_id == undefined || info.user_pwd == undefined ){
        ret.code = def.code_fail_account_remove_invalid_arg;
        return callback( ret );
    }
    if( info.user_id.length == 0 || info.user_pwd == 0 ){
        ret.code = def.code_fail_account_remove_invalid_arg;
        return callback( ret );
    }
    db.remove( info, function( db_result ){
        if( db_result.err != undefined ){
            ret.code = def.code_error_db;
            return callback( ret );
        }
        if( db_result.data == undefined ){
            ret.code = def.code_fail_account_remove_invalid_arg;
            return callback( ret );
        }
        ret.data = db_result.data;
        return callback( ret );
    });
}