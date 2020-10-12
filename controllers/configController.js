var setting = require( __basedir + '/controllers/modules/configModule');

function get_env_info(){
    return setting;
}

exports.get_env_info = get_env_info;