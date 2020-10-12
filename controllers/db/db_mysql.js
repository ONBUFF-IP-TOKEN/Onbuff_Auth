var mysql      = require('mysql');
var pool = mysql.createPool({
  host     : '52.231.76.187',
  user     : 'oauth',
  password : '12zhdlsghltk!@',
  database : 'membership',
  insecureAuth : false
});

function query(query, params, callback) {
  pool.getConnection( function( err, connection ){
    if( err ){
      return callback( err );
    }

    connection.query( query, params, function( err, result, fields ){
      connection.release();

      if( err ){
        console.error( err.sql );
        return callback( err );
      }

      callback( null, result );

    });
  });
}

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

  query( 'SELECT * FROM members WHERE `user_id` = ?', [info.user_id], function( err, data ){
      if( err )
          ret.err = err;
      else if( data.length == 1)
          ret.err = 'duplicate';
      
      return callback( ret );
  } );
}

exports.account_duplicate_check_user_nick = function( info, isExceptSelfNick, callback ){
  let ret = init_db_result();

  var param = [info.user_nick];
  var strQuery = 'SELECT * FROM members WHERE `user_nick` = ?';
  if( isExceptSelfNick){
      strQuery = 'SELECT * FROM members WHERE `user_nick` = ? and `user_nick` <> ?';
      param = [ info.user_nick, info.user_nik ];
  }

  //query( 'SELECT * FROM members WHERE user_nick = $1', [info.user_nick], function( err, data ){
      query( strQuery, param, function( err, data ){
      if( err )
          ret.err = err;
      else if( data.length == 1)
          ret.err = 'duplicate';
      
      return callback( ret );
  } );
}

exports.account_create = function( info, callback ){
  let ret = init_db_result();

  query( 'INSERT INTO members( `user_id`, `user_pwd`, `birthday`, `user_nick`, `user_phone_num`, `user_sex` ) VALUES( ?, ?, ?, ?, ?, ? )',
      [ info.user_id, info.user_pwd, info.birthday, info.user_nick, info.user_phone_num, info.user_sex ], function( err, data ){
      if( err ){
          ret.err = err;
      }else if( data.affectedRows != 0 ){
          ret.data = 'success';
      }

      return callback( ret );
  })
}

exports.update = function( info, callback ){
  let ret = init_db_result();

  query( 'UPDATE members SET `user_pwd` = ?, `birthday` = ?, `user_nick` = ?, `user_phone_num` = ?, `user_sex` = ? WHERE `user_id` = ?',
      [ info.user_pwd, info.birthday, info.user_nick, info.user_phone_num, info.user_sex, info.user_id ], function( err, data ){
      if( err ){
          ret.err = err;
      }else if( data.affectedRows != 0 ){
          ret.data = 'success';
      }

      return callback( ret );
  })
}

exports.remove = function( info, callback ){
  let ret = init_db_result();

  query( 'DELETE FROM members WHERE `user_id` = ? and `user_pwd` = ?', [ info.user_id, info.user_pwd ], function( err, data ){
      if( err ){
          ret.err = err;
      }else if( data.affectedRows != 0 ){
          ret.data = 'success';
      }

      return callback( ret );
  })
}

exports.set_key_pair = function( key, secret, type, callback ){
  let ret = init_db_result();

  query( 'INSERT INTO key_pair_app( `key`, `secret`, `type` ) VALUES ( ?, ?, ?);', [key, secret, type], function( err, data ) {
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
  var strQuery = 'SELECT * FROM key_pair_app WHERE `key` = ? and `secret` = ? and `type` >= 100;';
  if( isApp == false )
      strQuery = 'SELECT * FROM key_pair_app WHERE `key` = ? and `secret` = ? and `type` < 100;';

  query( strQuery, [key, secret ], function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 
      if( data.length != 0 )
          ret.data = data[0];

      return callback( ret );
  } );
}

exports.check_account = function( id, pwd, callback ){
  let ret = init_db_result();
  
  query( 'SELECT * FROM members WHERE `user_id` = ? and `user_pwd` = ?', [id, pwd ], function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 
      if( data.length != 0 )
          ret.data = data[0];
      return callback( ret );
  } );
}


exports.update_token_info = function( token_info, callback ){
  let ret = init_db_result();

  query( 'UPDATE members_oauth SET `access_token` = ?, `refresh_token` = ?, `token_expire` = ? WHERE `client_id` = ?  and `type` = ?', token_info, function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 
      
      if( data.affectedRows != 0 ){
        ret.data = 'success';
      }
      return callback( ret );
  } );
}

exports.update_token_info_app = function( token_info, callback ){
  let ret = init_db_result();

  query( 'UPDATE members_oauth_app SET `parent_access_token` = ?, `access_token` = ?, `refresh_token` = ?, `token_expire` = ? WHERE `client_id` = ?  and `type` = ? and `parent_type` = ?', 
      token_info, function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 
      
      if( data.affectedRows != 0 ){
        ret.data = 'success';
      }
      return callback( ret );
  } );
}

exports.clear_tokens = function( access_toekn, callback ){
  let ret = init_db_result();

  query( 'UPDATE members_oauth set `access_token` = ?, `refresh_token` = ?, `token_expire` = ? WHERE `access_token` = ?',
  ['','','',access_toekn], function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 

      if( data.affectedRows != 0 ){
        ret.data = 'success';
      }
      return callback( ret );
  });
}

exports.get_token_info_of_refresh_token = function( refresh_token, cur_time, type, callback ){
  let ret = init_db_result();

  query( 'SELECT * FROM members_oauth WHERE `refresh_token` = ? and `token_expire` > ? and `type` = ?', [refresh_token, cur_time, type], function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 

      if( data.length != 0 )
          ret.data = data[0];
      
      return callback( ret );
  });
}

exports.get_token_info_of_refresh_token_app = function( refresh_token, cur_time, type, callback ){
  let ret = init_db_result();

  query( 'SELECT * FROM members_oauth_app WHERE `refresh_token` = ? and `token_expire` > ? and `type` = ?', [refresh_token, cur_time, type], function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 

      if( data.length != 0 )
          ret.data = data[0];
      
      return callback( ret );
  });
}

exports.get_token_info_of_access_token = function( access_token, cur_time, callback ){
  let ret = init_db_result();

  query( 'SELECT * FROM members_oauth WHERE `access_token` = ? and `token_expire` > ?', [access_token, cur_time], function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 

      if( data.length != 0 )
          ret.data = data[0];
      
      return callback( ret );
  });
}

exports.get_info = function( info, callback ){
  let ret = init_db_result();
  
  query( 'SELECT * FROM members_oauth WHERE `client_id` = ? and `type` = ?', [ info[3], info[4] ], function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 

      if( data.length != 0 )
          ret.data = data[0];
      
      return callback( ret );
  });
}

exports.get_app_info = function( info, callback ){
  let ret = init_db_result();
  
  query( 'SELECT * FROM members_oauth_app WHERE `client_id` = ? and `type` = ? and `parent_type` = ?', [ info[4], info[5], info[6] ], function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 

      if( data.length != 0 )
          ret.data = data[0];
      
      return callback( ret );
  });
}


exports.set_info = function( info, callback ){
  let ret = init_db_result();
  
  query( 'INSERT INTO members_oauth( `client_id`, `type` ) VALUES ( ?, ? )', [ info[3], info[4] ], function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 

      if( data.affectedRows != 0 )
          ret.data = 'success';
      
      return callback( ret );
  });
}

exports.set_app_info = function( info, callback ){
  let ret = init_db_result();
  
  query( 'INSERT INTO members_oauth_app( `client_id`, `type`, `parent_type` ) VALUES ( ?, ?, ? )', [ info[4], info[5], info[6] ], function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 

      if( data.affectedRows != 0 )
          ret.data = 'success';
      
      return callback( ret );
  });
}

exports.clear_tokens_app = function( access_toekn, callback ){
  let ret = init_db_result();

  query( 'UPDATE members_oauth_app set `parent_access_token` = ?, `access_token` = ?, `refresh_token` = ?, `token_expire` = ? WHERE `access_token` = ?',
  ['','','','',access_toekn], function( err, data ){
      if( err ){
          ret.err = err;
          return callback( ret );
      } 

      if( data.affectedRows != 0 )
        ret.data = 'success';
      return callback( ret );
  });
}

