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
 * @apiSuccess {Object} userData  User information
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
 * @apiSuccess {Object} code   Status Code
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
 * @apiSuccess {Object} code   Status Code
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
 * @api {delete} /users/:username?session=session Delete user
 * @apiVersion 0.7.4
 * @apiName ChangeUser
 * @apiGroup User
 *
 * @apiParam {String} username   Username
 * @apiParam {String} session    Session
 *
 * @apiSuccess {Object} code   Status Code
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


/**
 * @api {get} /sessions/:session?session=auth_session Get information about session
 * @apiVersion 0.7.4
 * @apiName GetSessionInfo
 * @apiGroup User
 *
 * @apiParam {String} session       Session
 * @apiParam {String} auth_session  Authenticated Session
 *
 * @apiSuccess {Object} code   Status Code
 * 
 * @apiError IncorrectData    Incorrect input data
 * @apiError SessionNotFound  Username not found
 * @apiError Forbidden        Authentication session not exist
 */
module.exports.sessionGET = function (req, res) {

  // Check input data
  if(typeof(req.params.session) === 'undefined' || typeof(req.query.auth_session) === 'undefined') {

    // Log this
    log.error("Important API parameters undefined from " + req.connection.remoteAddress);

    // Return error
    res.status(400);
    res.json({ code: 400, description: 'Important parameter(s) undefined' });

    // Exit
    return;

  }

  // Check using RegExp
  if( req.params.session.length != 32 || req.query.auth_session.length != 32 || !(/^[0-9A-Fa-f]+$/).test(req.params.session) || !(/^[0-9A-Fa-f]+$/).test(req.query.auth_session) ) {

    // Log this
    log.error("Important API parameters incorrect from " + req.connection.remoteAddress);

    // Return error
    res.status(400);
    res.json({ code: 400, description: 'Important parameter(s) was incorrect' });

    // Exit
    return;

  }

  // Try to authenticate session
  userProvider.getSessionInformation(req.query.auth_session, function (err, data) {

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

    // Get information about requested session
    userProvider.getSessionInformation(req.params.session, function (err, data) {
    
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
      
      // Return session
      res.json({ code: 200, data: data });
      
      // Exit
      return;
    
    });

  });

}


/**
 * @api {delete} /sessions/:session?session=auth_session Delete session
 * @apiVersion 0.7.4
 * @apiName DeleteSession
 * @apiGroup User
 *
 * @apiParam {String} session       Session
 * @apiParam {String} auth_session  Authenticated session
 *
 * @apiSuccess {Object} code   Status Code
 * 
 * @apiError IncorrectData     Incorrect input data
 * @apiError SessionNotFound   Username not found
 * @apiError Forbidden         Session not exist
 */
module.exports.sessionDELETE = function (req, res) {

  // Check input data
  if(typeof(req.params.session) === 'undefined' || typeof(req.query.auth_session) === 'undefined') {

    // Log this
    log.error("Important API parameters undefined from " + req.connection.remoteAddress);

    // Return error
    res.status(400);
    res.json({ code: 400, description: 'Important parameter(s) undefined' });

    // Exit
    return;

  }

  // Check using RegExp
  if( req.params.session.length != 32 || req.query.auth_session.length != 32 || !(/^[0-9A-Fa-f]+$/).test(req.params.session) || !(/^[0-9A-Fa-f]+$/).test(req.query.auth_session) ) {

    // Log this
    log.error("Important API parameters incorrect from " + req.connection.remoteAddress);

    // Return error
    res.status(400);
    res.json({ code: 400, description: 'Important parameter(s) was incorrect' });

    // Exit
    return;

  }

  // Try to authenticate session
  userProvider.getSessionInformation(req.query.auth_session, function (err, data) {

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

    // Get information about requested session
    userProvider.deauthenticateSession(req.params.session, function (err, data) {

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

      // Return session
      res.json({ code: 200 });
      
      // Exit
      return;

    });

  });

}


/**
 * @api {put} /sessions/?username=username&password=password Authenticate username + password
 * @apiVersion 0.7.4
 * @apiName AuthenticateUsernamePassword
 * @apiGroup User
 *
 * @apiParam {String} username  Username
 * @apiParam {String} password  Password
 *
 * @apiSuccess {Object} code     Status Code
 * @apiSuccess {Object} session  Session
 * 
 * @apiError IncorrectData    Incorrect input data
 * @apiError InvalidData      Invalid input data
 * @apiError TooManyRequests  Too many authentication requests
 */
module.exports.sessionPUT = function (req, res) {

  // Check authentication attempts
  redisClient.get('rhcs:attempts:' + req.connection.remoteAddress, function (err, data) {
  
    // Catch error
    if(err) {
    
      // Log this
      log.error('Redis ' + err);
      
      // Return IntSrvErr code
      res.status(500);
      res.json({ code: 500, description: 'Internal Server Error' });
      
      // Exit
      return;
    
    }
    
    // Seems like we have at least one failed authentication attempt
    if(data) {
    
      // Parse JSON
      data = JSON.parse(data);
      
      // Check attempts count
      if(data.attempt == configuration.authenticationSettings.maxInvalidAttempts) {
      
        // Check banned timestamp
        var curTimestamp = Math.floor(Date.now() / 1000);
        
        // Ban still active
        if((data.timestamp + configuration.authenticationSettings.banInterval) > curTimestamp) {
        
          // Log this
          log.warn('Too many authentication requests from ' + req.connection.remoteAddress);
          
          // Return error
          res.status(429);
          res.json({ code: 429, description: 'Too many authentication attempts', retry_after: data.timestamp + configuration.authenticationSettings.banInterval })
          
          // Exit
          return;
        
        }
        
        // Ban timeout ended
        else {
        
          // Delete ban entity
          redisClient.del('rhcs:attempts:' + req.connection.remoteAddress);
        
        }
      
      }
    
    }
    
    // Check input data
    if(typeof(req.body.username) == 'undefined' || typeof(req.body.password) == 'undefined' || req.body.username.length < 3 || req.body.password.length < 3) {
    
      // Log this
      log.warn('Incorrect input data given from ' + req.connection.remoteAddress);
      
      // Return error
      res.status(400);
      res.json({ code: 400, description: 'Incorrect data given' });
      
      // Exit
      return;
    
    }
    
    // Authenticate it
    userProvider.authenticateUsername(req.body.username, req.body.password, function (err, adata) {
      
      // Error
      if(err) {

        // Log this
        log.error(err.message + " from " + req.connection.remoteAddress);

        // Handle error code
        if(err.errorCode == 500) {
          
          // Return error code
          res.status(500);
          res.json({ code: 500, description: 'Internal Server Error' });
          
          // Exit
          return;
        
        }

        else {
          
          // Return error code
          res.status(400);
          res.json({ code: 400, description: 'Invalid input data' });

          // Update ban information
          redisClient.get('rhcs:attempts:' + req.connection.remoteAddress, function (err, data) {

            // Catch error
            if(err) {

              // Log this
              log.error('Redis ' + err);

              // Return IntSrvErr code
              res.status(500);
              res.json({ code: 500, description: 'Internal Server Error' });

              // Exit
              return;

            }
            
            if(data) {
              
              // Update invalid attempts counter & last timestamp
              data = JSON.parse(data);
              data.attempt++;
              data.timestamp = Math.floor(Date.now() / 1000);
              
            }
            
            else {

              data = { attempt: 1, timestamp: Math.floor(Date.now() / 1000) };
            
            }
            
            // Save new data
            redisClient.set('rhcs:attempts:' + req.connection.remoteAddress, JSON.stringify(data));

            // Exit
            return;
          
          });
        
        }

      }
      
      if(!err) {
        
        // Return session
        res.json({ code: 200, session: adata.session });
      
        // Exit
        return;
        
      }
    
    });
  
  });

}