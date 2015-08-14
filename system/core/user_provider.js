/*

  RHCS.System.Core.User_Provider.js
  @version: 0.7.4;
  @author: Dmitriy <CatWhoCode> Nogay;

  RHCS Indigo users sub-system.

*/

// Utils
var util = require('util');

// Attaching Logger
var log = require('mag')('UserModule');

// Cryptography engine
var crypto = require('crypto');

// Load configuration
var configuration = require('./configuration.js');

// Attaching Redis
var redisClient = require('./redis_factory.js').init( require('mag'), configuration );

// Authentication Error
function AuthenticationError( settings, implementationContext ) {

  settings = ( settings || {} );  
  this.name = "AuthenticationError";
  this.message = ( settings.message || "An error occurred." );
  this.errorCode = ( settings.errorCode || "" );
  Error.captureStackTrace( this, AuthenticationError  );

}

util.inherits( AuthenticationError, Error );

/**
 * User.authenticateUsername - authenticating user via username + password
 * @param   {String} username Username
 * @param   {String} password Password
 * @param   {Function} callback Callback
 * @returns {Function} Callback
 */
module.exports.authenticateUsername = function ( username, password, callback ) {

  // Check input data
  if(typeof(username) != 'string' || typeof(password) != 'string' || typeof(callback) !== 'function') {
  
    // Callback type correct
    if(typeof(callback) == 'function') {
    
      // Return error callback
      return callback(new AuthenticationError({ message: 'Incorrect input data', errorCode: 400 }));
      
    }
    
    // Callback type invalid
    else {
      
      // Send it to logger
      log.error('Incorrect input data or callback');
      
      // Exit
      return;
    
    }
  
  }
  
  // Check input data length & username regexp
  if(username.length < 3 || password.length < 3 || !(/^[\w.@]+$/).test(username)) {
    
    // Return error callback
    return callback(new AuthenticationError({ message: 'Incorrect input data', errorCode: 400 }));
  
  }
  
  // Check username
  redisClient.get('rhcs:users:' + username, function (err, data) {
  
    // Catch error
    if(err) {

      // Log entity
      log.warn(err);

      // Return callback
      return callback(new AuthenticationError({ message: 'Redis ' + err, errorCode: 500 }));

    }
    
    // Username not exists
    if(!data) {
    
      // Return error callback
      return callback(new AuthenticationError({ message: 'Username not exists', errorCode: 404 }));
    
    }
    
    // Parse DB data
    data = JSON.parse(data);
    
    // Create hashed password
    var crypto = require('crypto');
    password = crypto.createHash('sha256').update(password + configuration.authenticationSettings.pepper).digest('hex');
    password = crypto.createHash('sha256').update(password + data.salt).digest('hex');
    
    // Check password
    if(data.password !== password) {
    
      return callback(new AuthenticationError({ message: 'Incorrect password', errorCode: 400 }));
    
    }
    
    // Generating new session
    var session = crypto.createHash('md5').update(((Math.random() * (999999 - 100000) + 100000) + Math.floor(Date.now())) + 'i3t3ap0t' ).digest('hex');
    
    // Save session
    redisClient.set('rhcs:sessions:' + session,JSON.stringify({ username: username, timestamp: Math.floor(Date.now() / 1000) }));
    
    // Return success callback
    return callback(undefined, { session: session });
  
  });

};

/**
 * User.deauthenticateSession - deauthenticate session
 * @param   {Session} session  Session
 * @param   {Function} callback Callback
 * @returns {Function} Callback
 */
module.exports.deauthenticateSession = function ( session, callback ) {

  // Check input data
  if(typeof(session) != 'string' || typeof(callback) !== 'function') {

    // Callback type correct
    if(typeof(callback) == 'function') {

      // Return error callback
      return callback(new AuthenticationError({ message: 'Incorrect input data', errorCode: 400 }));

    }

    // Callback type invalid
    else {

      // Send it to logger
      log.error('Incorrect input data or callback');

      // Exit
      return;

    }

  }

  // Check input data length & session regexp
  if(session.length != 32 || !(/^[0-9A-Fa-f]+$/).test(session)) {

    // Return error callback
    return callback(new AuthenticationError({ message: 'Incorrect input data', errorCode: 400 }));

  }
  
  redisClient.del('rhcs:sessions:' + session, function (err, data) {
  
    // Catch error
    if(err) {

      // Log entity
      log.warn(err);

      // Return callback
      return callback(new AuthenticationError({ message: 'Redis ' + err, errorCode: 500 }));

    }
    
    // Session not exists
    if(!data) { return callback(new AuthenticationError({ message: 'Session not exist', errorCode: 404 })); }
    else { return callback(undefined, { code: 200 }); }
  
  });

};


/**
 * User.getSessionInformation - get information about session
 * @param   {String} session Session
 * @param   {Function} callback Callback
 * @returns {Function} Callback with boolean
 */
module.exports.getSessionInformation = function ( session, callback ) {

  // Check input data
  if(typeof(session) != 'string' || typeof(callback) !== 'function') {

    // Callback type correct
    if(typeof(callback) == 'function') {

      // Return error callback
      return callback(new AuthenticationError({ message: 'Incorrect input data', errorCode: 400 }));

    }

    // Callback type invalid
    else {

      // Send it to logger
      log.error('Incorrect input data or callback');

      // Exit
      return;

    }

  }

  // Check input data length & session regexp
  if(session.length != 32 || !(/^[0-9A-Fa-f]+$/).test(session)) {

    // Return error callback
    return callback(new AuthenticationError({ message: 'Incorrect input data', errorCode: 400 }));

  }
  
  // Get data from Redis
  redisClient.get('rhcs:sessions:' + session, function (err, data) {
  
    // Catch error
    if(err) {

      // Log entity
      log.warn(err);

      // Return callback
      return callback(new AuthenticationError({ message: 'Redis ' + err, errorCode: 500 }));

    }
    
    // Session not exists
    if(!data) { return callback(new AuthenticationError({ message: 'Session not exists', errorCode: 404 })); }
    
    // Return data
    return callback(undefined, data);
  
  });

};

/**
 * User.getUserInformation - get information about user
 * @param   {String} username Username
 * @param   {Function} callback Callback
 * @returns {Function} Callback
 */
module.exports.getUserInformation = function ( username, callback ) {

  // Check input data
  if(typeof(username) != 'string' || typeof(callback) !== 'function') {

    // Callback type correct
    if(typeof(callback) == 'function') {

      // Return error callback
      return callback(new AuthenticationError({ message: 'Incorrect input data', errorCode: 400 }));

    }

    // Callback type invalid
    else {

      // Send it to logger
      log.error('Incorrect input data or callback');

      // Exit
      return;

    }

  }

  // Check input data length & username regexp
  if(username.length < 3 || !(/^[\w.@]+$/).test(username)) {

    // Return error callback
    return callback(new AuthenticationError({ message: 'Incorrect input data', errorCode: 400 }));

  }
  
  redisClient.get('rhcs:users:' + username, function (err, data) {
  
    // Catch error
    if(err) {

      // Log entity
      log.warn(err);

      // Return callback
      return callback(new AuthenticationError({ message: 'Redis ' + err, errorCode: 500 }));

    }
    
    // Username not found
    if(!data) {
    
      return callback(new AuthenticationError({ message: 'Username not found', errorCode: 404 }));
    
    }
    
    // Return username data
    return callback(undefined, data);
  
  });

}

/**
 * User.createUser - create user
 * @param   {String} username Username
 * @param   {String} password Password 
 * @param   {String} fullname First name
 * @param   {String} email    Email
 * @param   {String} birthday Birthday (ex: 11.07.1989)
 * @param   {Function} Callback
 * @returns {Function} Callback { code: %code% }
 */
module.exports.createUser = function ( username, password, fullname, email, birthday, callback ) {

  // Check input data
  if(
    
    typeof(username) != 'string' || 
    typeof(password) != 'string' || 
    typeof(fullname) != 'string' || 
    typeof(birthday) != 'string' || 
    typeof(email) != 'string' || 
    typeof(callback) !== 'function'
  
  ) {

    // Callback type correct
    if(typeof(callback) == 'function') {

      // Return error callback
      return callback(new AuthenticationError({ message: 'Incorrect input data', errorCode: 400 }));

    }

    // Callback type invalid
    else {

      // Send it to logger
      log.error('Incorrect input data or callback');

      // Exit
      return;

    }

  }
  
  // Check length and username with RegExp
  if(username.length < 3 || password.length < 3 || !(/^[\w.@]+$/).test(username) || fullname.length < 3 || birthday.length < 3) {

    // Return error callback
    return callback(new AuthenticationError({ message: 'Incorrect input data', errorCode: 400 }));

  }
  
  // Check username existing
  redisClient.get('rhcs:users:' + username, function (err, data) {
  
    // Catch error
    if(err) {

      // Log entity
      log.warn(err);

      // Return callback
      return callback(new AuthenticationError({ message: 'Redis ' + err, errorCode: 500 }));

    }
    
    // Username already exists
    if(data) { return callback(new AuthenticationError({ message: 'Username already exists', errorCode: 400 })); }
    
    // Create password hash
    var salt = crypto.createHash('md5').update(((Math.random() * (999999 - 100000) + 100000) + Math.floor(Date.now())) + 's08e21_th3c0mmunicati0ndeteri0rat10n' ).digest('hex');
    var hashedPassword = crypto.createHash('sha256').update(password + configuration.authenticationSettings.pepper).digest('hex');
    hashedPassword = crypto.createHash('sha256').update(hashedPassword + salt).digest('hex');
    
    // Save data
    var userData = {
    
      username: username,
      password: hashedPassword,
      email: email,
      birthday: birthday,
      fullname: fullname,
      salt: salt
    
    };
    
    // Save new user
    redisClient.set('rhcs:users:' + username, JSON.stringify(userData));
    
    // Exit
    return callback(undefined, { code: 200 });
  
  });

}

/**
 * User.deleteUser - delete user
 * @param   {String} username Username
 * @param   {Function} Callback
 * @returns {Function} Callback { code: %code% }
 */
module.exports.deleteUser = function ( username, callback ) {

  // Check, is username correct
  if(username.length < 3 || !(/^[\w.@]+$/).test(username)) {
  
    return callback(new AuthenticationError({ message: 'Incorrect input data', errorCode: 400 }), undefined);
  
  }
  
  // Check via database
  redisClient.get('rhcs:users:' + username, function(err, data) {
  
    // Catch error
    if(err) {

      // Log entity
      log.warn(err);

      // Return callback
      return callback(new AuthenticationError({ message: 'Redis ' + err, errorCode: 500 }));

    }
    
    // Check payload
    if(!data) {
      
      return callback(new AuthenticationError({ message: 'Username not found', errorCode: 404 }), undefined);
    
    }
    
    // Delete entity
    redisClient.del('rhcs:users:' + username, function (err, data) {
    
      // Catch error
      if(err) {

        // Log entity
        log.warn(err);

        // Return callback
        return callback(new AuthenticationError({ message: 'Redis ' + err, errorCode: 500 }));

      }
      
      // Check status
      if(typeof(data) == 'undefined' || data == 0) {
      
        return callback(new AuthenticationError({ message: 'Username not found', errorCode: 404 }));
      
      }
      
      // Success
      return callback(undefined, { code: 200 });
    
    });
  
  });

};