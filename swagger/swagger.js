const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');

var options = {
    explorer : true
  };

exports.initSwagger = function( app ){
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, options));
}
  
