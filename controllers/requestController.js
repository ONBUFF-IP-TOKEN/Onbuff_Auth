var http = require('http');
var https = require('https');
var querystring = require('querystring');
var log4js = require('log4js');
var logger = log4js.getLogger('api');

function makeOption( host, host_port, path, method, content, contentType = 'application/x-www-form-urlencoded' ){
    
    var post_options = {
        host: host,
        port: host_port,
        path: path,
        method: method,
        headers: {
            'Content-Type': contentType,
            'Content-Length': Buffer.byteLength(content)
        }
    };

    return post_options;
}

function makeGetOption( url_host, url_path, urlf, host_port, method, queryString, headersContent, contentType = 'application/x-www-form-urlencoded' ){
    //console.log( url_host );
    //console.log( url_path + queryString );

    var post_options = {
        host: url_host,
        path: url_path + queryString,
        port: host_port,
        method: method,
        headers: {
           'Content-Type': contentType,
           'accept' : '*/*'
        }
    };

    if( headersContent != undefined ){
        console.log( JSON.stringify(headersContent) );
        for( var e in headersContent ){
            var value = headersContent[e]
            console.log(e)
            console.log(value)

            post_options.headers[e] = value;
        }
    }

    return post_options;
}

function postRequest( post_options, post_data, httpsUsed = false ){
    var Response = {
        result : false,
        message : null
    }

    if( httpsUsed == false ){
        return new Promise( (resolve) => {
            var data ='';
            var post_req = http.request(post_options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    //logger.info('Response: ' + chunk);
                    //resolve(chunk);
                    data += chunk;
                });
                res.on( 'end', function() {
                    logger.info('Response: ' + data);
                    resolve(data);
                });
            });

            post_req.on('error', function(error){
                logger.info('error : ' + error.message );
                Response.message = error.message;
                resolve(Response);
            });
        
            // post the data
            post_req.write(post_data);
            post_req.end();
        });
    }else if( httpsUsed == true ){
        return new Promise( (resolve) => {
            var data ='';
            var post_req = https.request(post_options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    //logger.info('Response: ' + chunk);
                    //resolve(chunk);
                    data += chunk;
                });
                res.on( 'end', function() {
                    logger.info('Response: ' + data);
                    resolve(data);
                });
            });

            post_req.on('error', function(error){
                logger.info('error : ' + error.message );
                Response.message = error.message;
                resolve(Response);
            });
        
            // post the data
            post_req.write(post_data);
            post_req.end();
        });
    }
}

function getRequest(get_options, httpsUsed = false){
    if( httpsUsed == false ){
        return new Promise( (resolve) => {
            http.get(get_options, (res) => {
                const { statusCode } = res;
                const contentType = res.headers['content-type'];
            
                let error;
                if (statusCode !== 200) {
                    error = new Error('Request Failed.\n' +
                                    `Status Code: ${statusCode}`);
                } 
                // else if (!/^application\/json/.test(contentType)) {
                //     error = new Error('Invalid content-type.\n' +
                //                     `Expected application/json but received ${contentType}`);
                // }
                if (error) {
                    console.error(error.message);
                    // consume response data to free up memory
                    res.resume();
                    
                    return resolve( error.message );
                }
            
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        return resolve( rawData );
                    } catch (e) {
                        console.error(e.message);
                        return resolve( e.message );
                    }
                });
            }).on('error', (e) => {
                console.error(`Got error: ${e.message}`);
                return resolve( e.message );
            });
        });
    }else if( httpsUsed ){
        return new Promise( (resolve) => {
            https.get(get_options, (res) => {
                const { statusCode } = res;
                const contentType = res.headers['content-type'];
                //console.log( contentType );
                let error;
                if (statusCode !== 200) {
                    error = new Error('Request Failed.\n' +
                                    `Status Code: ${statusCode}`);
                } 
                // else if (!/^application\/json/.test(contentType)) {
                //     error = new Error('Invalid content-type.\n' +
                //                     `Expected application/json but received ${contentType}`);
                // }
                if (error) {
                    console.error(error.message);
                    // consume response data to free up memory
                    res.resume();
                    
                    return resolve( error.message );
                }
            
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        return resolve( rawData );
                    } catch (e) {
                        console.error(e.message);
                        return resolve( e.message );
                    }
                });
            }).on('error', (e) => {
                console.error(`Got error: ${e.message}`);
                return resolve( e.message );
            });
        });
    }
}

async function post_normal( data, callback, https = false ){
    var post_data = querystring.stringify( data.params );
    //console.log( post_data );
    var port = 80;
    if( https == true )
        port = 443;
    var post_options = makeOption( data.url_base, port, data.url_string, 'POST', post_data );
    var retdata = await postRequest( post_options, post_data, https );
    return callback( retdata );
}

async function get_normal( data, callback, https = false ){
    var port = 80;
    if( https == true )
        port = 443;
    var post_options = makeGetOption( data.url_base, data.url_string, data.url, port, 'GET', data.queryString, data.headers  );
    var retdata = await getRequest( post_options, https );
    console.log( retdata );
    return callback( retdata );
}

async function get_meta_file( data, callback ){
    var result = await getRequest( data.full_url);
    return callback( result );
}

exports.post_normal = post_normal;
exports.get_meta_file = get_meta_file;
exports.get_normal = get_normal;