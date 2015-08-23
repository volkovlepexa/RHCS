/*

  RHCS.System.Core.APIRouters.Users.js
  @version: 0.7.4;
  @author: Dmitriy <CatWhoCode> Nogay;

  RHCS Indigo users API 

*/

// Utils
var util = require('util');

// Attaching Logger
var log = require('mag')('UserAPI');

// Load configuration
var configuration = require('../configuration.js');

// Attach user module
var userProvider = require('../providers/user_provider.js');

/**
 * @api {get} /users/:username?session=session Get User information
 * @apiVersion 0.7.4
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {String} username Username
 * @apiParam {String} session Session
 *
 * @apiSuccess {String} username  Username
 * @apiSuccess {String} fullname  Name
 * @apiSuccess {String} email     EMail
 * @apiSuccess {String} birthday  Birthday
 *
 * @apiError IncorrectData     Incorrect input data
 * @apiError UserNotFound      Username not exist
 * @apiError Forbidden         Session not exist
 */

module.exports.userGET = function (req, res) {

  // Check input data
  if(typeof(req.params.username) === 'undefined' || typeof(req.query.session) === 'undefined') {
  
    // Log this
    log.error("Important API parameters undefined from " + req.connection.remoteAddress);
    
    // Return error
    res.status(400);
    res.json({ code: 400, description: 'Important parameter(s) undefined' });
    
    // Exit
    return;
  
  }
  
  // Check using RegExp
  if( req.params.username.length < 3 || req.query.session.length != 32 || !(/^[\w.@]+$/).test(req.params.username) || !(/^[0-9A-Fa-f]+$/).test(req.query.session) ) {
  
    // Log this
    log.error("Important API parameters incorrect from " + req.connection.remoteAddress);

    // Return error
    res.status(400);
    res.json({ code: 400, description: 'Important parameter(s) was incorrect' });

    // Exit
    return;
  
  }
  
  // Try to authenticate session
  userProvider.getSessionInformation(req.query.session, function (err, data) {
  
    // Session error
    if(err) {
    
      // Log this
      log.error(err.message + " from " + req.connection.remoteAddress);
      
      // Send error
      res.status(err.errorCode);
      res.json({ code: err.errorCode, description: err.message });
      
      // Exit
      return;
    
    }
    
    // Session validated
    // Get username data
    userProvider.getUserInformation(req.params.username, function (err, data) {
    
      // User error
      if(err) {

        // Log this
        log.error(err.message + " from " + req.connection.remoteAddress);

        // Send error
        res.status(err.errorCode);
        res.json({ code: err.errorCode, description: err.message });

        // Exit
        return;

      }
      
      data = JSON.parse(data);
      
      // Send data
      res.status(200);
      res.json({
      
        code: 200,
        username: data.username,
        fullname: data.fullname,
        email: data.email,
        birthday: data.birthday
      
      });
      
      // Exit
      return;
    
    });
  
  });

}


/**
 * @api {post} /users/:username?session=session Create user
 * @apiVersion 0.7.4
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiParam {String} username Username
 * @apiParam {String} password Password
 * @apiParam {String} email    EMail
 * @apiParam {String} fullname Full Name
 * @apiParam {String} birthday Birthday (ex: 11.07.1989)
 * @apiParam {String} session  Session
 *
 * @apiSuccess {String} code   Status Code
 *
 * @apiError IncorrectData     Incorrect input data
 * @apiError UsernameExists    Username already exists
 * @apiError Forbidden         Session not exist
 */

module.exports.userPOST = function (req, res) {

  // Check input data
  if(
    
    typeof(req.params.username) == 'undefined' || 
    typeof(req.body.fullname) == 'undefined' ||
    typeof(req.body.email) == 'undefined' ||
    typeof(req.body.password) == 'undefined' ||
    typeof(req.body.birthday) == 'undefined' ||
    typeof(req.query.session) == 'undefined'
  
  ) {

    // Log this
    log.error("Important API parameters undefined from " + req.connection.remoteAddress);

    // Return error
    res.status(400);
    res.json({ code: 400, description: 'Important parameter(s) undefined' });

    // Exit
    return;

  }
  
  // Check length & RegExp
  if(
    
    req.params.username.length < 3 || 
    req.params.username.length > 64 || 
    
    req.body.fullname.length < 3 || 
    req.body.fullname.length > 64 || 
    
    req.body.email.length < 3 || 
    req.body.email.length > 128 || 
    
    req.body.birthday.length < 6 || 
    req.body.birthday.length > 12 || 
    
    req.body.password.length < 6 || 
    
    req.query.session.length != 32 || 
    
    !(/^[\w.@]+$/).test(req.params.username) || 
    !(/^[0-9A-Fa-f]+$/).test(req.query.session) 
  
  ) {

    // Log this
    log.error("Important API parameters incorrect from " + req.connection.remoteAddress);

    // Return error
    res.status(400);
    res.json({ code: 400, description: 'Important parameter(s) was incorrect' });

    // Exit
    return;

  }

  // Check session
  userProvider.getSessionInformation(req.query.session, function (err, data) {
  
    // Session error
    if(err) {

      // Log this
      log.error(err.message + " from " + req.connection.remoteAddress);

      // Send error
      res.status(err.errorCode);
      res.json({ code: err.errorCode, description: err.message });

      // Exit
      return;

    }

    // Creating user
    userProvider.createUser(req.params.username, req.body.password, req.body.fullname, req.body.email, req.body.birthday, function (err, data) {
        
      // User creating error
      if(err) {

        // Log this
        log.error(err.message + " from " + req.connection.remoteAddress);

        // Send error
        res.status(err.errorCode);
        res.json({ code: err.errorCode, description: err.message });

        // Exit
        return;

      }
      
      // Return 201 Created code, if succeed.
      res.status(201);
      res.json({ code: 201 });
      
      // Exit
      return;
        
    });
  
  });

}


/**
 * @api {put} /users/:username?session=session Change user data
 * @apiVersion 0.7.4
 * @apiName ChangeUser
 * @apiGroup User
 *
 * @apiParam {String} username   Username
 * @apiParam {String} session    Session
 * @apiParam {Object} changeData Object with data to change
 *
 * @apiSuccess {String} code   Status Code
 *
 * @apiError IncorrectData     Incorrect input data
 * @apiError UsernameExists    Username already exists (if we want change username)
 * @apiError Forbidden         Session not exist
 */

module.exports.userPUT = function (req, res) {

  // Check input data
  if(typeof(req.params.username) === 'undefined' || typeof(req.query.session) === 'undefined') {

    // Log this
    log.error("Important API parameters undefined from " + req.connection.remoteAddress);

    // Return error
    res.status(400);
    res.json({ code: 400, description: 'Important parameter(s) undefined' });

    // Exit
    return;

  }

  // Check using RegExp
  if( req.params.username.length < 3 || req.query.session.length != 32 || !(/^[\w.@]+$/).test(req.params.username) || !(/^[0-9A-Fa-f]+$/).test(req.query.session) ) {

    // Log this
    log.error("Important API parameters incorrect from " + req.connection.remoteAddress);

    // Return error
    res.status(400);
    res.json({ code: 400, description: 'Important parameter(s) was incorrect' });

    // Exit
    return;

  }

  // Try to authenticate session
  userProvider.getSessionInformation(req.query.session, function (err, data) {

    // Session error
    if(err) {

      // Log this
      log.error(err.message + " from " + req.connection.remoteAddress);

      // Send error
      res.status(err.errorCode);
      res.json({ code: err.errorCode, description: err.message });

      // Exit
      return;

    }

    // Session validated
    userProvider.editUser(req.params.username, req.body, function (err, data) {
    
      // Session error
      if(err) {

        // Log this
        log.error(err.message + " from " + req.connection.remoteAddress);

        // Send error
        res.status(err.errorCode);
        res.json({ code: err.errorCode, description: err.message });

        // Exit
        return;

      }
      
      // Success
      res.status(data.code)
      res.json({ code: data.code });
      
      // Exit
      return;
      
    });

  });

}


/**
 * @api {delete} /users/:username?session=session Change user data
 * @apiVersion 0.7.4
 * @apiName ChangeUser
 * @apiGroup User
 *
 * @apiParam {String} username   Username
 * @apiParam {String} session    Session
 *
 * @apiSuccess {String} code   Status Code
 * 
 * @apiError IncorrectData     Incorrect input data
 * @apiError UsernameNotFound  Username not found
 * @apiError Forbidden         Session not exist
 */

module.exports.userDELETE = function (req, res) {

  // Check input data
  if(typeof(req.params.username) === 'undefined' || typeof(req.query.session) === 'undefined') {

    // Log this
    log.error("Important API parameters undefined from " + req.connection.remoteAddress);

    // Return error
    res.status(400);
    res.json({ code: 400, description: 'Important parameter(s) undefined' });

    // Exit
    return;

  }

  // Check using RegExp
  if( req.params.username.length < 3 || req.query.session.length != 32 || !(/^[\w.@]+$/).test(req.params.username) || !(/^[0-9A-Fa-f]+$/).test(req.query.session) ) {

    // Log this
    log.error("Important API parameters incorrect from " + req.connection.remoteAddress);

    // Return error
    res.status(400);
    res.json({ code: 400, description: 'Important parameter(s) was incorrect' });

    // Exit
    return;

  }

  // Try to authenticate session
  userProvider.getSessionInformation(req.query.session, function (err, data) {

    // Session error
    if(err) {

      // Log this
      log.error(err.message + " from " + req.connection.remoteAddress);

      // Send error
      res.status(err.errorCode);
      res.json({ code: err.errorCode, description: err.message });

      // Exit
      return;

    }

    // Session validated
    userProvider.deleteUser(req.params.username, function (err, data) {
    
      // Session error
      if(err) {

        // Log this
        log.error(err.message + " from " + req.connection.remoteAddress);

        // Send error
        res.status(err.errorCode);
        res.json({ code: err.errorCode, description: err.message });

        // Exit
        return;

      }
      
      // Return OK code
      res.json({ code: 200 });
      
      // Exit
      return;
    
    });

  });

}