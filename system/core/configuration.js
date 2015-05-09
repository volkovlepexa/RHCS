/**
 * Indigo.Core.Configuration - Indigo configuration file
 * @author: Dmitriy <CatWhoCode> Nogay;
 * @version: 0.7.4 Laughing Bear;
 */

var config = {};
var fs = require('fs');

// Redis configuration
config.redis = {};

// Redis DB Connection Settings
config.redis = {

  // Redis Server IP.
  // Warning - Redis have a plaintext protocol. It is fully unsecured.
  // Please, if you use extranet Redis server - use one of amount tunnels to this server (VPN as example)
  // Sending plaintext data isn't secure thing.
  host: '127.0.0.1',

  // Redis Server port
  port: 6379,

  // Is we need password to authication?
  // Cool guys alvays using passwords
  usePassword: true,

  // Password in plaintext
  password: 'furetnth',

  // Redis can handle amounts of databases.
  // Default, connected client (without SELECT query) using database with index '0'
  dbIndex: 0

}

// Port configuration
config.serverPorts = {
  
  httpPort: 1384,
  httpsPort: 1385
  
};

// TLS configuration
config.httpsConfiguration = {};

config.httpsConfiguration = {
  key: fs.readFileSync("./system/data/tls/prv.key"),
  cert: fs.readFileSync("./system/data/tls/pub.crt")
}

// Authication
config.auth = {};

// Max invalid authication attempts before ban
config.auth.maxInvalidAttempts = 6;

// Ban timeout (in seconds)
config.auth.banInterval = 60;

// Global password hash parameter
config.auth.pepper = "ed36b6aa92c6293a02e7b2cc79704b56";

// Change theese values to your own awesome and creative values
// Please, not too big.
config.auth.sessionRandomSalt = 'hirsh_will_rull_the_world';
config.auth.deauthTokenRandomSalt = 'iWishThatICouldBeLikeTheCookies';

// Push configuration
module.exports = config;