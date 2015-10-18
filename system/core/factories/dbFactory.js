/**

  Database factory for LokiJS and Indigo

  @author: Dmitriy <CatWhoCode> Nogay;
  @version: 0.7.5;

*/

// Load configuration
var configuration = require('../configuration.js');

// Load modules
var loki = require('lokijs');
var log = require('mag')("Database");

// Bootstrap
log.debug('Attempt to load database (' + configuration.database.file + ')');

// Attempt to load database
var db = new loki( configuration.database.file, configuration.database.lokiConfiguration );

// Error catching
db.on('error', function (error) {
  
  // Log
  log.error(error);
  
});

// Export database pointer
module.exports = db;