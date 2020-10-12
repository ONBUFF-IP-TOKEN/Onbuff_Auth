
const fs = require( 'fs' );
const log4js = require('log4js');
const logger = log4js.getLogger('config');
const configPath = 'data/config.json';

const config = module.exports = {
    config:{
        envs : []
    },
    loadConfig: async () => {
        await new Promise((resolve, reject) => {
            fs.stat( configPath, (err) => {
                if( err !== null && err.code !== 'ENOENT' ){
                    return reject(err);
                }
                return resolve();
            });
        });

        const data = await new Promise((resolve, reject) => {
            logger.info( 'reading config from file' );
            fs.readFile( configPath, 'utf8', (err, data) => {
                if( err ){
                    return reject( err );
                }
                return resolve(data);
            });
        });

        config.config = JSON.parse(data);
    }
}

async function init() {
    // logger.info( 'loading file....');
    // try{
    //     await config.loadConfig();
    // }catch(err){
    //     logger.error( 'Error loading config file :' + err );
    // }
}

init();