exports.def_token_expire_time = 3600 * 6 * 1000;
exports.def_token_expire_time_app = 3600 * 8 * 1000;

exports.code_ok = { code : '000', result : 'OK' };
exports.code_invalid_arg = { code : '001', result : 'INVALID ARGUMENT'};
exports.code_invalid_pair = { code : '002', result : 'INVALID KEYPAIR'};
exports.code_fail_new_pair = { code : '003', result : 'CREATE FAIL NEW PAIR'};
exports.code_fail_check_account = { code : '004', result : 'CHECK ACCOUNT FAIL'};
exports.code_fail_make_tokens = { code : '005', result : 'MAKE TOKEN FAIL' };
exports.code_fail_invalid_access_token = { code : '006', result : 'INVALID ACCESS TOKEN' };
exports.code_fail_invalid_refresh_token = { code : '007', result : 'INVALID REFRESH TOKEN' };
exports.code_fail_not_exist_app_info = { code : '008', result : 'NOT EXIST APP DB INFO'};
exports.code_fail_db_insert = { code : '009', result : 'DB INSERT FAIL'};

exports.code_error_db = { code : '200', result : 'DB SYSTEM ERR'};

exports.code_fail_account_create_invalid_arg = { code : '100', result : 'invalid user info'};
exports.code_duplicate_user_id = { code : '101', result : 'duplicate user_id'};
exports.code_duplicate_user_nick = { code : '102', result : 'duplicate user_nick'};
exports.code_invalid_user_id = { code : '103', result : 'invalid user_id'};
exports.code_fail_account_update_invalid_arg = { code : '104', result : 'invalid user info'};
exports.code_fail_account_remove_invalid_arg = { code : '105', result : 'invalid user info'};
