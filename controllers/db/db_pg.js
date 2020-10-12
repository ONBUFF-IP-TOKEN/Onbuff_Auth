var { Pool } = require('pg');
var assert = require('assert');

const DBconfig = {
    host: '127.0.0.1',
    user: 'postgres',
    database: 'membership',
    password: '12zhdlsghltk!@',
    port: 5432,
    max: 20
};

var pool = new Pool(DBconfig);

function connect( callback){
    pool.connect( callback );
}

function query(query, params, callback) {
    connect(function (err, client, done) {
        if (err) {
            console.log("db connect error : ", err.code);
            return callback(err);
        }
        client.query(query, params, function (err, result) {
            done();
            if (err){
                if (err.code == '40P01') {
                    console.log('Warning: Retrying deadlocked transaction: ', query, params);
                    return doIt();
                } else {
                    console.log("db query error : " + err.code);
                }
                
                return callback(err, result);
            }

            callback(null, result);
        });
    });
}

exports.query = query;


function init_db_result(){
    var db_result = { 
        err : undefined,
        data : undefined
    };

    db_result.err = undefined,
    db_result.data = undefined;

    return db_result;
}

exports.account_duplicate_check_user_id = function( info, callback ){
    let ret = init_db_result();

    query( 'SELECT * FROM members WHERE user_id = $1', [info.user_id], function( err, data ){
        if( err )
            ret.err = err;
        else if( data.rows.length == 1)
            ret.err = 'duplicate';
        
        return callback( ret );
    } );
}

exports.account_duplicate_check_user_nick = function( info, isExceptSelfNick, callback ){
    let ret = init_db_result();

    var param = [info.user_nick];
    var strQuery = 'SELECT * FROM members WHERE user_nick = $1';
    if( isExceptSelfNick){
        strQuery = 'SELECT * FROM members WHERE user_nick = $1 and user_nick <> $2';
        param = [ info.user_nick, info.user_nik ];
    }

    //query( 'SELECT * FROM members WHERE user_nick = $1', [info.user_nick], function( err, data ){
        query( strQuery, param, function( err, data ){
        if( err )
            ret.err = err;
        else if( data.rows.length == 1)
            ret.err = 'duplicate';
        
        return callback( ret );
    } );
}

exports.account_create = function( info, callback ){
    let ret = init_db_result();

    query( 'INSERT INTO members( user_id, user_pwd, birthday, user_nick, user_phone_num, user_sex ) VALUES( $1, $2, $3, $4, $5, $6 )',
        [ info.user_id, info.user_pwd, info.birthday, info.user_nick, info.user_phone_num, info.user_sex ], function( err, data ){
        if( err ){
            ret.err = err;
        }else if( data.rows.length != 0 ){
            ret.data = data.rows[0];
        }

        return callback( ret );
    })
}

exports.update = function( info, callback ){
    let ret = init_db_result();

    query( 'UPDATE members SET user_pwd = $1, birthday = $2, user_nick = $3, user_phone_num = $4, user_sex = $5 WHERE user_id = $6',
        [ info.user_pwd, info.birthday, info.user_nick, info.user_phone_num, info.user_sex, info.user_id ], function( err, data ){
        if( err ){
            ret.err = err;
        }else if( data.rowCount != 0 ){
            ret.data = 'success';
        }

        return callback( ret );
    })
}

exports.remove = function( info, callback ){
    let ret = init_db_result();

    query( 'DELETE FROM members WHERE user_id = $1 and user_pwd = $2', [ info.user_id, info.user_pwd ], function( err, data ){
        if( err ){
            ret.err = err;
        }else if( data.rowCount != 0 ){
            ret.data = 'success';
        }

        return callback( ret );
    })
}

exports.set_key_pair = function( key, secret, type, callback ){
    let ret = init_db_result();

    query( 'INSERT INTO key_pair_app( key, secret, type ) VALUES ( $1, $2, $3)', [key, secret, type], function( err, data ) {
        if( err ){
            ret.err = err;
        }else{
            ret.data = data;
        }

        return callback( ret );
    });
}

exports.check_key_pair = function( key, secret, isApp, callback ){
    let ret = init_db_result();
    var strQuery = 'SELECT * FROM key_pair_app WHERE key = ($1) and secret = ($2) and type >= 100;';
    if( isApp == false )
        strQuery = 'SELECT * FROM key_pair_app WHERE key = ($1) and secret = ($2) and type < 100;';

    query( strQuery, [key, secret ], function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 
        if( data.rows.length != 0 )
            ret.data = data.rows[0];

        return callback( ret );
    } );
}

exports.check_account = function( id, pwd, callback ){
    let ret = init_db_result();
    
    query( 'SELECT * FROM members WHERE user_id = ($1) and user_pwd = ($2)', [id, pwd ], function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 
        if( data.rows.length != 0 )
            ret.data = data.rows[0];
        return callback( ret );
    } );
}

exports.update_token_info = function( token_info, callback ){
    let ret = init_db_result();

    query( 'UPDATE members_oauth SET access_token = $1, refresh_token = $2, token_expire = $3 WHERE client_id = $4  and type = $5', token_info, function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 
        
        //success
        ret.data = token_info;
        return callback( ret );
    } );
}

exports.update_token_info_app = function( token_info, callback ){
    let ret = init_db_result();

    query( 'UPDATE members_oauth_app SET parent_access_token = $1, access_token = $2, refresh_token = $3, token_expire = $4 WHERE client_id = $5  and type = $6 and parent_type=$7', 
        token_info, function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 
        
        //success
        ret.data = token_info;
        return callback( ret );
    } );
}

exports.clear_tokens = function( access_toekn, callback ){
    let ret = init_db_result();

    query( 'UPDATE members_oauth set access_token = $1, refresh_token = $2, token_expire = $3 WHERE access_token = $4',
    ['','','',access_toekn], function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 

        ret.data = access_toekn;
        return callback( ret );
    });
}

exports.get_token_info_of_refresh_token = function( refresh_token, cur_time, type, callback ){
    let ret = init_db_result();

    query( 'SELECT * FROM members_oauth WHERE refresh_token = ($1) and token_expire > ($2) and type = ($3)', [refresh_token, cur_time, type], function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 

        if( data.rows.length != 0 )
            ret.data = data.rows[0];
        
        return callback( ret );
    });
}

exports.get_token_info_of_refresh_token_app = function( refresh_token, cur_time, type, callback ){
    let ret = init_db_result();

    query( 'SELECT * FROM members_oauth_app WHERE refresh_token = ($1) and token_expire > ($2) and type = ($3)', [refresh_token, cur_time, type], function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 

        if( data.rows.length != 0 )
            ret.data = data.rows[0];
        
        return callback( ret );
    });
}

exports.get_token_info_of_access_token = function( access_token, cur_time, callback ){
    let ret = init_db_result();

    query( 'SELECT * FROM members_oauth WHERE access_token = ($1) and token_expire > ($2)', [access_token, cur_time], function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 

        if( data.rows.length != 0 )
            ret.data = data.rows[0];
        
        return callback( ret );
    });
}

exports.get_info = function( info, callback ){
    let ret = init_db_result();
    
    query( 'SELECT * FROM members_oauth WHERE client_id = ($1) and type = ($2)', [ info[3], info[4] ], function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 

        if( data.rows.length != 0 )
            ret.data = data.rows[0];
        
        return callback( ret );
    });
}

exports.get_app_info = function( info, callback ){
    let ret = init_db_result();
    
    query( 'SELECT * FROM members_oauth_app WHERE client_id = ($1) and type = ($2) and parent_type = ($3)', [ info[4], info[5], info[6] ], function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 

        if( data.rows.length != 0 )
            ret.data = data.rows[0];
        
        return callback( ret );
    });
}


exports.set_info = function( info, callback ){
    let ret = init_db_result();
    
    query( 'INSERT INTO members_oauth( client_id, type ) VALUES ( $1, $2 )', [ info[3], info[4] ], function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 

        if( data.rows.length != 0 )
            ret.data = data.rows[0];
        
        return callback( ret );
    });
}

exports.set_app_info = function( info, callback ){
    let ret = init_db_result();
    
    query( 'INSERT INTO members_oauth_app( client_id, type, parent_type ) VALUES ( $1, $2, $3 )', [ info[4], info[5], info[6] ], function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 

        if( data.rows.length != 0 )
            ret.data = data.rows[0];
        
        return callback( ret );
    });
}

exports.clear_tokens_app = function( access_toekn, callback ){
    let ret = init_db_result();

    query( 'UPDATE members_oauth_app set parent_access_token = $1, access_token = $2, refresh_token = $3, token_expire = $4 WHERE access_token = $5',
    ['','','','',access_toekn], function( err, data ){
        if( err ){
            ret.err = err;
            return callback( ret );
        } 

        ret.data = access_toekn;
        return callback( ret );
    });
}

// exports.addUser = function (username, password, site_id, money, callback) {
//     assert(username);
//     var hashedPassword = "";
    
//     query('SELECT COUNT(*) count FROM users WHERE lower(username) = lower($1) ', [username], function (err, data) {
//         if (err) return callback(err);
//         if (data.rows[0].count == 1) return callback('USERNAME_TAKEN', null, true);

//         query('INSERT INTO users(username, password, site_id, remoney) VALUES($1, $2, $3, $4) RETURNING id', [username, password, site_id, money], function (err, res) {
//             if (err) return callback(err);
//             return callback(null);
//         });

//     });


// };
 
 
//  exports.updateUserMoney = function (username, password, money, callback) {
//     query('UPDATE users SET remoney = $1 WHERE lower(username) = lower($2) and lower(password) = lower($3)', [money, username, password], function (err, data) {
//         if (err)
//             return callback(err);

//         callback(null, data.rows);
//     });
// };

// exports.updateUserMoneyFromURL = function (id, money, callback) {
//     query('SELECT COUNT(*) count FROM users WHERE id = $1 ', [id], function (err, data) {
//         if (err) return callback(err);
//         if (data.rows[0].count == 0) return callback('NO_USER', null, true);

//         query('UPDATE users SET remoney = remoney + $1 WHERE id = $2 ', [money, id], function (err, data) {
//             if (err) {
//                 return callback(err);
//             }
//             else {
//                 callback(null, data.rows);
//             }
//         });
//     });
// };



// exports.getUserMoney = function (id, callback) {
//     query('SELECT remoney  FROM users WHERE id = $1 ', [id], function (err, data) {
//         if (err) return callback(err);

//         if (data.rows.length === 0)
//             return callback(null, 'NO_USER');

//         callback(data.rows[0].remoney);
//     });
// };

// exports.validateUser = function (username, password, callback) {
//     assert(username && password);

//     query('SELECT id, username, password, remoney FROM users WHERE lower(username) = lower($1) and lower(password) = lower($2)', [username, password], function (err, data) {
//         if (err) return callback(err);

//         if (data.rows.length === 0)
//             return callback('NO_USER');

//         callback(null, data.rows);
//     });
// };


// exports.validateUserFromURL = function (username, callback) {
//     assert(username );
//     var user = username;
//     query('SELECT id, username, password, remoney FROM users WHERE username = lower($1)', [user], function (err, data) {
//         if (err) return callback(err);

//         if (data.rows.length === 0)
//             return callback('NO_USER');

//         callback(null, data.rows);
//     });
// };

// exports.getUserInfo = function (username, callback) {
//     query('SELECT id, username, password, remoney, site_id FROM users WHERE lower(username) = lower($1)', [username], function (err, data) {
//         if (err) return callback(err);

//         if (data.rows.length === 0)
//             return callback('NO_USER');

//         callback(null, data.rows);
//     });
// };

// exports.getDealerPercent = function (callback) {
//     query('SELECT dealer_percent FROM dealer_percent', null, function (err, data) {
//         if (err) return callback(10);

//         if (data.rows.length === 0)
//             return callback(10);

//         callback(data.rows[ 0 ].dealer_percent);
//     });
// };

// exports.updateRecom = function (name, id, callback) {
//     assert(callback);
//     var sql = "UPDATE users SET remoney = remoney + GREATEST((SELECT v.getmoney FROM recomcals_view v WHERE users.id = v.id and recommender = $1),0) ";
//     query(sql, [name], function (err, res) {
//         if (err) return callback(err);
//         callback(null, res);
//     });

// };

// exports.SetStartGame = function (roomName, black, white, startTime, dealmoney, black_start_money, white_start_money, dealer_percent, callback) {
//     query("INSERT INTO games( black, white, start_time, room_name, deal_money, black_start_money, white_start_money, dealer_percent ) VALUES( $1, $2, $3, $4, $5, $6, $7, $8 ) RETURNING num",
//         [black, white, startTime, roomName, dealmoney, black_start_money, white_start_money, dealer_percent],
//         function (err, result) {
//             if (err)
//                 return callback( err );

//             return callback(err, result);
//         }
//     );
// };

// exports.SetEndGame = function (roomName, black, white, winner, endTime, gameIndex, black_end_money, white_end_money, dealer_profit, callback ) {
//     query("UPDATE games SET winner = $1, end_time = $2, black_end_money=$3, white_end_money=$4, dealer_money=$5 WHERE num = $6 and room_name = $7",
//         [winner, endTime, black_end_money, white_end_money, dealer_profit, gameIndex, roomName],
//         function (err, result) {
//             if (err)
//                 return callback(err);

//             return callback(err, result);
//         }
//     );
// }



// exports.getHistory = function (param, callback) {
//     //query("SELECT num, black, white, start_time, end_time, winner,room_name, deal_money,black_start_money,black_end_money, white_start_money, white_end_money, dealer_percent, dealer_money FROM  GAMES WHERE lower(black) = lower($1) or lower(white) = lower($2)",
//     var sql = param;
//     query(sql,[],  function (err, data) {
//             if (err)
//                 return callback(err);

//             if (data.rows.length == 0)
//                 return callback('NO_HISTORY');

//             return callback(err, data.rows);
//         }
//     );
// }
