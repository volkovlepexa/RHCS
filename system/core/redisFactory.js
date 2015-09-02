/*

  RHCS.System.Core.Redis_Factory.js
  @version: 0.7.4;
  @author: Dmitriy <CatWhoCode> Nogay;
  @requires: Redis, RHCS.System.Core.Configuration;
  
  This module creating and sharing Redis DB connection
  throw Node.js module-caching feature.
  Factory-pattern module.

*/

// Create logger
var log = require('mag')('RedisFactory');
  
// Load configuration
var configuration = require('./configuration.js');

// Include Redis library
var redis = require('redis');
  
// Log
log.debug("Connecting to %s:%d", configuration.redis.host, configuration.redis.port);
  
// Authentication
// We need to set authPasswordOption:
//   -> to string with password, if we need to authenticate
//   -> to null, if authentication not required
var authPasswordOption = null;
  
if(configuration.redis.usePassword) {

  authPasswordOption = configuration.redis.password;
  log.debug("Connection: authentication required");
  
}
  
// Create client
var redisClient = redis.createClient(
  configuration.redis.port,
  configuration.redis.host,
  {
  
    parser: 'hiredis',
    auth_pass: authPasswordOption
  
  }
);

// Catch error
redisClient.on("error", function (err) {

  // Log this error
  log.error(err);

});

// Success
redisClient.on("ready", function () {

  log.debug("Successful connected");
  
});

module.exports = redisClient;