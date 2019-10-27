var env = process.env.NODE_ENV || 'development';
var config = require('./config.json');
 if(env === 'development' || env === 'test'){
     var envConfig = config[env];
     Object.keys(envConfig).forEach((key) => { // object.keys creates an array of the keys in the json file
         process.env[key] = envConfig[key];
     }) 
 }