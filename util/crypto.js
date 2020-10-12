var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha512");

var secret = '1234567890!@#$%^&*()';

 function encrypt(plaintext) {
    var ciphertext = CryptoJS.AES.encrypt(plaintext, secret).toString();
    return ciphertext.toString( 'base64' );
}

exports.decrypt = function(ciphertext) {
    var bytes  = CryptoJS.AES.decrypt(ciphertext, secret);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    return originalText
}

exports.make_key_pair = function( time ){
    var key = encrypt( time );
    var secret = encrypt( key );

    return {key : key , secret : secret };
}

exports.make_access_token = function(){
    return SHA256(Math.random().toString(36)).toString();
}

exports.make_refresh_token = function(){
    return SHA256(Math.random().toString(36)).toString();
}

exports.encrypt = encrypt;