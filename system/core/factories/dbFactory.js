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

// Predefine important collections
var systemCollections = configuration.database.systemCollections;

// Load database
db.loadDatabase({}, function () {

  // Checking each collection
  systemCollections.forEach(function (item, iteration, array) {

    // Chect it
    if(db.getCollection(item) === null) {

      // Create collection
      db.addCollection(item);

      // Log it
      log.info('Create unexisting collection "' + item + '"');

    }

  });

});

// Export database pointer
module.exports = db;

/**
 * db.initializeDatabase - Create all unexisting tables
 * @param {Function}  Callback
 * @return {Function} Callback
 */
db.initializeDatabase = function (callback) {

  // Load database
  db.loadDatabase({}, function () {

    // Checking each collection
    systemCollections.forEach(function (item, iteration, array) {

      // Chect it
      if(db.getCollection(item) === null) {

        // Create collection
        db.addCollection(item);

        // Log it
        log.info('Initialize: Create unexisting collection "' + item + '"');

      }

    });

    // Return callback
    return callback(undefined, true);

  });

}

/*

  We are adding our custom function to LokiJS database object.
  This function named as protectedGetCollection().
  If collection not exists, this function create it.

*/

/**
 * db.protectedGetCollection - Protected LokiJS getCollection
 * @param   {String} collection Collection name
 * @returns {Object} LokiJS collection
 */
db.protectedGetCollection = function (collection) {

  // Checking collection name
  if(typeof(collection) === 'undefined') {

    // Log it
    log.error('Call the db.protectedGetCollection() without "collection" parameter');

    // Return null
    return null;

  }

  // If we have zero-length collection name
  if(collection.length == 0) {

    // Log it
    log.error('Call the db.protectedGetCollection() with zero-length "collection" parameter');

    // Return null
    return null;

  }

  // Connect to db
  db.loadDatabase({}, function (err, data) {

    // Check, is this collection exists
    if(!db.getCollection(collection)) {

      // Create collection
      db.addCollection(collection);

      // Log it
      log.debug('Creating unexisting collection "' + collection + '"');

    }

    // Return created / existed collection
    return db.getCollection(collection);

  });

}
