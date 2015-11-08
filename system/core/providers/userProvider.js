/**

  User subsystem provider for RHCS Indigo

  @author: Dmitriy <CatWhoCode> Nogay;
  @version: 0.7.5;

*/

// @FUTURE: Вынести проверку входных параметров в отдельную функцию
// @FUTURE: Добавить поддержку OTP

/* Load module dependencies */
var configuration = require('../configuration.js');
var indigoError = require('../particles/indigoError.js');
var database = require('../factories/dbFactory.js');
var log = require('mag')('UserProvider');

var User = {

  // Create user
  create: function () {},

  // Edit user
  edit: function () {},

  // Delete user
  delete: function () {},

  // Get user information
  information: function () {}

};

var Session = {

  // Get session information
  information: function () {},

  // Authenticate user credentials (username & password)
  authenticate: function () {},

  // Deauthenticate session
  deauthenticate: function () {}

};

var OTP = {

  // Configure OTP
  configure: function () {},

  // Edit OTP
  edit: function () {},

  // Check OTP token
  check: function () {}

};

/**
 * User.create - Create user
 * @param   {String}   username Username (example: fwoods)
 * @param   {String}   password Password (example: woods11071984)
 * @param   {String}   email    Email (example: frank.woods@cia.gov)
 * @param   {String}   name     Full name (example: Frank Woods)
 * @param   {Function} callback Callback
 * @returns {Fucntion} Callback
 */
User.create = function (username, password, email, name, callback) {

  // Check callback defenition
  if(typeof(callback) !== 'function') {

    // Guys, we are in very worst situation
    log.warn("Call the User.create() function without callback");

    // Create our personal callback() endpoint
    callback = function (error, data) {

      // Catch error
      if(error) {

        // Log it
        log.error('Catched (User.create): ' + error);

      }

    }

  }

  // Check parameters defenition
  if(

      typeof(username) === 'undefined' || typeof(password) === 'undefined' ||
      typeof(email) === 'undefined' || typeof(name) === 'undefined'

  ) {

    // Return error in callback
    return callback(new indigoError({ errorCode: 400, message: 'Important parameter(s) undefined' }));

  }

  // Check username
  if(username.length < 3 || !(/^[\w]+$/).test(username)) {

    // Return error in callback
    return callback(new indigoError({ errorCode: 400, message: 'Incorrect username' }));

  }

  // Check name
  if(name.length < 3 || !(/^[\wа-яА-Я ]+$/).test(name)) {

    // Return error in callback
    return callback(new indigoError({ errorCode: 400, message: 'Incorrect name' }));

  }

  // Check password length (in passwords, nothing else matter)
  if(password.length < 3) {

    // Return error in callback
    return callback(new indigoError({ errorCode: 400, message: 'Password too short' }));

  }

  // Connect to DB
  database.loadDatabase({}, function () {

    // Get collection
    var users = database.getCollection('users');

    // Check, is user already exists
    if(users.findOne({ username: username }) !== null) {

      // Return error
      return callback(new indigoError({ errorCode: 409, message: "User already exists" }));

    }

    // Hashing password
    var crypto = require('crypto');

    // Generate salt
    var salt = crypto.createHash('md5').update(Math.floor(Math.random() * 1000000) + 'ThanksESAForRosetta&Philae').digest('hex');

    // Round one - sha256( password + pepper )
    password = crypto.createHash('sha256').update(password + configuration.keys.pepper).digest('hex');

    // Round two - sha256( roundOne + salt )
    password = crypto.createHash('sha256').update(password + salt).digest('hex');

    // Save new user
    users.insert({ username: username, password: password, passwordSalt: salt, email: email, fullname: name, otpEnabled: false, otpSecret: "" });

    // Return successful callback
    return callback(undefined, true);

  });

}

/**
 * User.edit - Edit user
 * @param   {String}   username   Username
 * @param   {Object}   parameters Object with parameters to change
 * @param   {Function} callback   Callback
 * @returns {Function} Callback
 */
User.edit = function  (username, parameters, callback) {

  // Check callback defenition
  if(typeof(callback) !== 'function') {

    // Guys, we are in very worst situation
    log.warn("Call the User.edit() function without callback");

    // Create our personal callback() endpoint
    callback = function (error, data) {

      // Catch error
      if(error) {

        // Log it
        log.error('Catched (User.edit): ' + error);

      }

    }

  }

  // Check username
  if(typeof(username) === 'undefined' || username.length < 3 || !(/^[\w.@]+$/).test(username)) {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect username', errorCode: 400 }));

  }

  // Connect to DB
  database.loadDatabase({}, function () {

    // Get collection
    var users = database.getCollection('users');

    // Get user
    var user = users.findOne({ username: username });

    // Check, is user already exists
    if(user === null) {

      // Return error
      return callback(new indigoError({ errorCode: 404, message: "User not exists" }));

    }

    // If we need to update username
    if(typeof(parameters.username) !== 'undefined') {

      // Check username
      if(parameters.username.length < 3 || !(/^[\w]+$/).test(parameters.username)) {

        // Return error in callback
        return callback(new indigoError({ errorCode: 400, message: 'Incorrect username' }));

      }

    }

    // If we need to update name
    if(typeof(parameters.name) !== 'undefined') {

      // Check name
      if(parameters.name.length < 3 || !(/^[\wа-яА-Я ]+$/).test(parameters.name)) {

        // Return error in callback
        return callback(new indigoError({ errorCode: 400, message: 'Incorrect name' }));

      }

    }

    // If we need to update password
    if(typeof(parameters.password) !== 'undefined') {

      // Check password length (in passwords, nothing else matter)
      if(parameters.password.length < 3) {

        // Return error in callback
        return callback(new indigoError({ errorCode: 400, message: 'Password too short' }));

      }

      // Rehash password

      // Round #1 - Password + Pepper
      var round = require('crypto').createHash('sha256').update(parameters.password + configuration.keys.pepper).digest('hex');

      // Round #2 - r1 + salt
      parameters.password = require('crypto').createHash('sha256').update(round + user.passwordSalt).digest('hex');

    }

    // Merge two objects
    var updatedResult = require('merge')(user, parameters);

    // Prevent salt changing
    delete updatedResult.passwordSalt;

    // Attempt to save into db
    try {

      // Save
      users.update(updatedResult);

    } catch (error) {

      // Return error callback
      return callback(new indigoError({ errorCode: 500, message: error }))

    }

    // Return successfull callback
    return callback(undefined, true);

  });

}

/**
 * User.delete - Delete user
 * @param  {String}     username Username
 * @param  {Function}   callback Callback
 * @return {Function}   Callback
 */
User.delete = function (username, callback) {

  // Check callback defenition
  if(typeof(callback) !== 'function') {

    // Guys, we are in very worst situation
    log.warn("Call the User.delete() function without callback");

    // Create our personal callback() endpoint
    callback = function (error, data) {

      // Catch error
      if(error) {

        // Log it
        log.error('Catched (User.delete): ' + error);

      }

    }

  }

  // Check username
  if(typeof(username) === 'undefined' || username.length < 3 || !(/^[\w.@]+$/).test(username)) {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect username', errorCode: 400 }));

  }

  database.loadDatabase({}, function () {

    // Get collection
    var users = database.getCollection('users');

    // Remove entity
    try {

      users.removeWhere({ username: username });

    } catch (error) {

      // Return error
      return callback(new indigoError({ errorCode: 500, message: error }));

    }

    // Also, remove all related sessions
    var sessions = database.getCollection('sessions');
    session.removeWhere({ username: username });

    // Success
    return callback(undefined, true);

  });

}

/**
 * User.information - Get user info
 * @param  {String}     username Username
 * @param  {Function}   callback Callback
 * @return {Function}   Callback
 */
User.information = function (username, callback) {

  // Check callback defenition
  if(typeof(callback) !== 'function') {

    // Guys, we are in very worst situation
    log.warn("Call the User.information() function without callback");

    // Create our personal callback() endpoint
    callback = function (error, data) {

      // Catch error
      if(error) {

        // Log it
        log.error('Catched (User.information): ' + error);

      }

    }

  }

  // Check username
  if(typeof(username) === 'undefined' || username.length < 3 || !(/^[\w.@]+$/).test(username)) {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect username', errorCode: 400 }));

  }

  database.loadDatabase({}, function () {

    // Get collection
    var users = database.getCollection('users');

    // Get user
    var user = users.findOne({ username: username });

    // Check, is user exist
    if(user === null) {

      // Return error
      return callback(new indigoError({ errorCode: 404, message: "User not exists" }));

    }

    // Success
    return callback(undefined, {

      username: user.username,
      password: user.password,
      passwordSalt: user.passwordSalt,
      email: user.email,
      fullname: user.fullname,
      otpEnabled: user.otpEnabled

    });

  });

}

/**
 * Session.authencticate - Authencticate user credentials
 * @param  {String}   username Username
 * @param  {String}   password User password
 * @param  {Function} callback Callback
 * @return {Function}          Callback
 */
Session.authenticate = function (username, password, callback) {

  // Check callback defenition
  if(typeof(callback) !== 'function') {

    // Guys, we are in very worst situation
    log.warn("Call the Session.authencticate() function without callback");

    // Create our personal callback() endpoint
    callback = function (error, data) {

      // Catch error
      if(error) {

        // Log it
        log.error('Catched (Session.authencticate): ' + error);

      }

    }

  }

  // Check username
  if(typeof(username) === 'undefined' || username.length < 3 || !(/^[\w.@]+$/).test(username)) {

    // Return error
    return callback(new indigoError({ errorCode: 400, message: 'Incorrect username' }));

  }

  // Check password
  if(typeof(password) === 'undefined' || password.length < 3) {

    // Return error
    return callback(new indigoError({ errorCode: 400, message: 'Incorrect password' }));

  }

  database.loadDatabase({}, function () {

    // Get collection
    var users = database.getCollection('users');

    // Get user
    var user = users.findOne({ username: username });

    // Check, is user not exist
    if(user === null) {

      // Return error
      return callback(new indigoError({ errorCode: 404, message: "User not exists" }));

    }

    // Load crypto module
    var crypto = require('crypto');

    // Hash input password
    var hashedPassword = crypto.createHash('sha256').update(password + configuration.keys.pepper).digest('hex');
    hashedPassword = crypto.createHash('sha256').update(hashedPassword + user.passwordSalt).digest('hex');

    // Compare passwords
    if(user.password !== hashedPassword) {

      // Return error
      return callback(new indigoError({ errorCode: 403, message: "Invalid password" }));

    }

    // Generate session
    var session = Date.now() + "." + Math.round(Math.random() * 1000000000);
    session = crypto.createHash('md5').update(session).digest('hex');

    // Save session
    var sessions = database.getCollection('sessions');

    var session = {

      session: session,
      username: username

    };

    // If OTP enabled for user - mark session as unvalidated
    session.validated = !user.otpEnabled;

    // Insert new session
    sessions.insert(session);

    // Return successfull callback
    return callback(undefined, { session: session.session, username: session.username, timestamp: Math.round(session.meta.created / 1000) })

  });

}

/**
 * Session.information - Get session information
 * @param  {String}   session  Session
 * @param  {Function} callback Callback
 * @return {Function}          Callback
 */
Session.information = function (session, callback) {

  // Check callback defenition
  if(typeof(callback) !== 'function') {

    // Guys, we are in very worst situation
    log.warn("Call the Session.information() function without callback");

    // Create our personal callback() endpoint
    callback = function (error, data) {

      // Catch error
      if(error) {

        // Log it
        log.error('Catched (Session.information): ' + error);

      }

    }

  }

  // Check username
  if(typeof(session) === 'undefined' || session.length !== 32 || !(/^[0-9A-Fa-f]+$/).test(session)) {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect session', errorCode: 400 }));

  }

  database.loadDatabase({}, function () {

    // Get collection
    var sessions = database.getCollection('sessions');

    // Get user
    var dbSession = sessions.findOne({ session: session });

    // Check, is user exist
    if(dbSession === null) {

      // Return error
      return callback(new indigoError({ errorCode: 404, message: "Session not exists" }));

    }

    // Success
    return callback(undefined, {

      session: dbSession.session,
      username: dbSession.username,
      timestamp: Math.round(dbSession.meta.created / 1000)

    });

  });

}

/**
 * Session.deauthenticate - Deauthenticate session
 * @param  {String}   session  Session
 * @param  {Function} callback Callback
 * @return {Function}          Callback
 */
Session.deauthenticate = function (session, callback) {

  // Check callback defenition
  if(typeof(callback) !== 'function') {

    // Guys, we are in very worst situation
    log.warn("Call the Session.information() function without callback");

    // Create our personal callback() endpoint
    callback = function (error, data) {

      // Catch error
      if(error) {

        // Log it
        log.error('Catched (Session.information): ' + error);

      }

    }

  }

  // Check username
  if(typeof(session) === 'undefined' || session.length !== 32 || !(/^[0-9A-Fa-f]+$/).test(session)) {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect session', errorCode: 400 }));

  }

  database.loadDatabase({}, function () {

    // Get collection
    var sessions = database.getCollection('sessions');

    // Get session
    var dbSession = sessions.findOne({ session: session });

    // Check, is user exist
    if(dbSession === null) {

      // Return error
      return callback(new indigoError({ errorCode: 404, message: "Session not exists" }));

    }

    // Remove it
    sessions.remove(dbSession);

    // Return callback
    return callback(undefined, true);

  });

}

/* Exporting functions */
module.exports.User = User;
module.exports.Session = Session;
