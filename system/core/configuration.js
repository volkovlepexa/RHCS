/*

  RHCS.System.Core.configuration.js
  @version: 0.7.4;
  @author: Dmitriy <CatWhoCode> Nogay;
  
  This module containts RHCS Indigo system configurationuration.
  You are pleasure to add your own properties here.
  But, please, use object for your module properties and
  put little description of each property.

*/

var configuration = {};

////////////////////////////////
//  BEGIN CONFIGURATION FILE  // 
////////////////////////////////

// Redis DB Connection Settings
configuration.redis = {

  // Redis Server host
  // Remember - Redis using fully unsecured, plaintext protocol.
  // If you want to connect to remote server - please, use some kind of tunnels (like VPN).
  host: '127.0.0.1',

  // Redis Server port
  port: 6379,

  // Is we need password to authication?
  // Cool guys alvays use passwords
  usePassword: true,

  // Password
  password: 'furetnth',

  // Redis can handle amounts of databases.
  // Default, connected client (without SELECT query) using database with index '0'
  dbIndex: 0

}

// Indigo HTTP(S) Server ports
configuration.indigoWebserverPorts = {
  
  // Port of HTTP unsecured server
  httpPort: 1384,
  
  // Port of HTTPS secured server
  httpsPort: 1385
  
};

// Authentication parameters
configuration.authenticationSettings = {

  // Max invalid authication attempts before ban
  maxInvalidAttempts: 6,

  // Ban timeout (in seconds)
  banInterval: 300,

  // Additional global password hash parameter
  pepper: "ed36b6aa92c6293a02e7b2cc79704b56",
  
  // Cookie signing secret
  cookieSecret: "9c946958780c7cd6f6dc89a8121d0d1e"

};

// Root directory
configuration.rootDirectory = { 

  // Installation directory
  root: '/mnt/Storage/Devworlds/RHCS/indigo'

}

// Weather Underground
configuration.wundergroundAPIData = {

  locationCountry: 'RU',
  locationCity: 'Novosibirsk',
  apikey: 'd5076c4f0f39c02d'
  
}

////////////////////////////
// END CONFIGURATION FILE // 
////////////////////////////

// Push configuration object as module
module.exports = configuration;