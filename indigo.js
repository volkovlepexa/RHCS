/*

  RHCS.Indigo
  @version: 0.7.4;
  @author: Dmitriy <CatWhoCode> Nogay;
  
  Main server application.

*/

// Modules
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var express = require('express');
var fs = require('fs');

// Attach logger
var mag = require('mag');
var log = mag('Indigo');

// Hello World
log.info("RHCS Indigo v0.7.4 Laughing Bear");
log.info("Bootstrapping..");

// Load configuration
var configuration = require('./system/core/configuration.js');

// Attach Redis from factory
redisClient = require('./system/core/redis_factory.js').init( mag, configuration );

// Log
log.debug('Attaching Express..');

// Initialize Indigo server
var indigo = require('express')();

// Create listeners
require('./system/core/server_init.js')( mag, indigo, fs, configuration );

// Static data route
indigo.use('/assets', express.static('./system/template/assets'));

// Using cookie-parser module with cryptographic signature support
indigo.use(cookieParser());

// Parse POST on-the-go
indigo.use(bodyParser.urlencoded({ extended: false }));

// Allow CORS in Indigo server
indigo.use(function(req, res, next) {
  
  // Allow CORS
  res.header("Access-Control-Allow-Origin", "*");
  
  // Allow CORS header
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  // Go to next handler
  return next();
  
});

// @TODO: Вынести весь API с роутерами в отдельные модули 
// @TODO: Запилить нормальную обработку ошибок для Redis

// Indigo Main Router
var indigoRouter = express.Router();
indigo.use('/api/v1', indigoRouter);

/**
 * returnAPIerror - Returning API JSON errror
 * @param {Object} req Server request object
 * @param {Object} res Server response object
 * @param {Object} error Error code and message
 */
function returnAPIerror(req, res, error) {

  // Return ERR code
  res.status(error.code);
  res.json({ code: error.code, error: error.message });

  // Exit
  return;

}

indigo.get('/', function (req, res) { res.json({ minute: 'ms' }); });

/** 
 * Session.POST - Authenticating user credentials and returning session
 * @require: Username, Password
 * @return: Session
 */
indigoRouter.route('/session').post(function (req, res) {
  
  // Check parameters
  if(typeof(req.body.username) == 'undefined' || typeof(req.body.password) == 'undefined') {
  
    // Return error
    res.status(400);
    res.json({ code: 400, error: 'Username or password not defined' });
    
    // Exit
    res.end();
  
  }
  
  // Check length and signs
  if( req.body.username.length < 3 || req.body.password.length < 3 || !(/^[\w.@]+$/.test(req.body.username)) ) {
  
    // Return error
    res.status(400);
    res.json({ code: 400, error: 'Username or password incorrect' });
    
    // Exit
    return;
  
  }
  
  // Get user data
  redisClient.get('rhcs:users:' + req.body.username, function (err, data) {
  
    // Catch errors
    if(err) {
    
      // Log
      log.error('Redis ' + err.message);
      
      // Return error code
      res.status(500);
      res.json({ code: 500, error: 'Internal Server Error' });
      
      // Exit
      return;
    
    }
    
    // Uset not exists
    if(!data) {
    
      // Return error
      res.status(403);
      res.json({ code: 403, error: 'Username or password invalid' });
      
      // Exit
      return;
    
    }
    
    // Parse data
    data = JSON.parse(data);
    
    // If user exists - check password
    var crypto = require('crypto');
    var password = crypto.createHash('sha256').update(
      crypto.createHash('sha256').update(
        req.body.password + configuration.authenticationSettings.pepper
      ).digest('hex') + data.salt
    ).digest('hex');
    
    // Password incorrect
    if(password !== data.password) {
    
      // Return error
      res.status(403);
      res.json({ code: 403, error: 'Username or password invalid' });
      
      // Exit
      return;
    
    }
    
    // Create session
    var session = crypto.createHash('md5').update((Math.floor(Math.random() * (99988888898 + 1)) + 111111111) + 'randdigest').digest('hex');
    
    // Save session to Redis DB
    try {
    
      redisClient.set('rhcs:sessions:' + session, JSON.stringify({ username: req.body.username, timestamp: Math.round(new Date().getTime() / 1000), ip: req.ip }));
      
    } catch (e) {
    
      // Log
      log.error(e.message);
      
      // Send error code
      res.status(500);
      res.json({ code: 500, error: 'Internal Server Error' });
      
      // Exit
      return;
    
    }
    
    // Return session
    res.json({ code: 200, session: session });
    
    // Exit
    return;
  
  });

})

// Catch DELETE error
.delete(function (req, res) { returnAPIerror(req, res, { code: 400, message: 'Session not defined' }); })

// Catch GET error
.get(function (req, res) { returnAPIerror(req, res, { code: 400, message: 'Session not defined' }); });

/** 
 * Session.DELETE - Delete session
 * @require: Session
 * @return: null
 */
indigoRouter.route('/session/:session').delete(function (req, res) {

  // Check session length and regexp
  if(req.params.session.length != 32 || !(/^[0-9A-Fa-f]+$/.test(req.params.session))) {
  
    // Send error
    res.status(400);
    res.json({ code: 400, error: 'Session incorrect' });
    
    // Exit
    return;
    
  }
  
  // Try to delete 
  redisClient.del('rhcs:sessions:' + req.params.session, function (err, state) {
  
    // Catch errors
    if(err) {

      // Log
      log.error('Redis ' + err.message);

      // Return error code
      res.status(500);
      res.json({ code: 500, error: 'Internal Server Error' });

      // Exit
      return;

    }
    
    // Check, is this session deleted
    if(state) {
    
      // Send OK code
      res.json({ code: 200 });
      
      // Exit
      return;
      
    }
    
    else {
    
      // Send ERR code
      res.json({ code: 404, error: 'Session not found' });
      
      // Exit
      return;
    
    }
    
  });

})

/** 
 * Session.GET - Get information about session
 * @require: Session
 * @return: Session info
 */
.get(function (req, res) {

  // Check session length and regexp
  if(req.params.session.length != 32 || !(/^[0-9A-Fa-f]+$/.test(req.params.session))) {

    // Send error
    res.status(400);
    res.json({ code: 400, error: 'Session incorrect' });

    // Exit
    return;

  }
  
  // Get info from Redis
  redisClient.get('rhcs:sessions:' + req.params.session, function (err, data) {
  
    // Catch error
    if(err) {

      // Log
      log.error('Redis ' + err.message);

      // Return error code
      res.status(500);
      res.json({ code: 500, error: 'Internal Server Error' });

      // Exit
      return;

    }
    
    // Check session existing
    if(!data) {
    
      // Send ERR code
      res.status(404);
      res.json({ code: 404, error: 'Session not found' });
      
      // Exit
      return;
    
    }
    
    // Parse data
    data = JSON.parse(data);
    
    // Return data
    res.json({
    
      code: 200,
      username: data.username,
      timestamp: data.timestamp,
      ip: data.ip
      
    });
    
    // Exit
    return;
  
  });

});

// Catch USERS error
indigoRouter.route('/users/')
  .get(function (req,res) { returnAPIerror(req, res, { code: 400, message: 'Username not defined' }); })
  .delete(function (req,res) { returnAPIerror(req, res, { code: 400, message: 'Username not defined' }); })

/** 
 * Users.POST - Create user
 * @require: Username, Password, Email, Fullname
 * @return: User data
 */
.post(function (req, res) {

  // Check input data existing
  if(

    typeof(req.body.username) == 'undefined' ||
    typeof(req.body.password) == 'undefined' ||
    typeof(req.body.email) == 'undefined' ||
    typeof(req.body.birthday) == 'undefined' ||
    typeof(req.body.fullname) == 'undefined' ||
    typeof(req.body.session) == 'undefined'

  ) {

    // Return ERR code
    returnAPIerror(req, res, { code: 400, message: 'One of parameters undefined' });

    // Exit
    return;

  }

  // Check length
  if(

    req.body.username.length < 3 ||
    req.body.email.length < 3 ||
    req.body.password.length < 3 ||
    req.body.birthday.length < 3 ||
    req.body.fullname.length < 3 ||
    req.body.session.length != 32

  ) {

    // Return ERR code
    returnAPIerror(req, res, { code: 400, message: 'One of parameters incorrect' });

    // Exit
    return;

  } 

  // Check username & birthday via RegExp
  // !Note: We not check another params, because we don't need to validate password, and we cannot really check email with RegExp
  if(!(/^[\w.@]+$/).test(req.body.username) || !(/^[0-9.]+$/).test(req.body.birthday) || !(/^[0-9A-Fa-f]+$/).test(req.body.session)) {

    // Return ERR code
    returnAPIerror(req, res, { code: 400, message: 'One of parameters incorrect' });

    // Exit
    return;

  }

  // Check session
  redisClient.get('rhcs:sessions:' + req.body.session, function (err, data) {
  
    // Catch error
    if(err) {

      // Log
      log.error('Redis ' + err.message);

      // Return error code
      res.status(500);
      res.json({ code: 500, error: 'Internal Server Error' });

      // Exit
      return;

    }
    
    // Session not exist
    if(!data) {
    
      // Return ERR code
      res.status(403);
      res.json({ code: 403, error: 'Session not exist' });
      
      // Exit
      return
    
    }
    
    // Continue, if session exists
    redisClient.get('rhcs:users:' + req.body.username, function (err, data) {

      // Catch errors
      if(err) {

        // Log
        log.error('Redis ' + err.message);

        // Return error code
        res.status(500);
        res.json({ code: 500, error: 'Internal Server Error' });

        // Exit
        return;

      }

      // User already exists
      if(data) {

        // Return ERR code
        res.status(409);
        res.json({ code: 409, message: 'User already exist' });

        // Exit
        return;

      }

      // Create user object
      var user = {

        username: req.body.username,
        fullname: req.body.fullname,
        email: req.body.email,
        birthday: req.body.birthday

      };

      // Create crypto interface & salt
      var crypto = require('crypto');
      user.salt = crypto.createHash('md5').update(Math.floor(Math.random() * 1000000000000) + 'edigest').digest('hex').substr(0,16);

      // Hashing password
      user.password = crypto.createHash('sha256').update(req.body.password + configuration.authenticationSettings.pepper);
      user.password = crypto.createHash('sha256').update(user.password + user.salt).digest('hex');

      // Save data
      try {

        redisClient.set('rhcs:users:' + req.body.username, JSON.stringify(user));

      } catch (e) {

        // Catch error
        log.error(e.message);

        // Send ERR code
        returnAPIerror(req, res, { code: 500, message: 'Internal Server Error' });

        // Exit
        return;

      }


      // Return OK code
      res.json({ code: 200 });

      // Exit
      return;

    });
  
  });

});

indigoRouter.route('/users/:username')

/** 
 * Users.GET - Get information about user
 * @require: Username, Session
 * @return: User data
 */
.get(function (req, res) {

  // Check username length & regexp
  if(req.params.username.length < 3 || !(/^[\w.@]+$/.test(req.params.username))) {
  
    // Return ERR code
    returnAPIerror(req, res, { code: 400, message: 'Username incorrect' });
    
    // Exit
    return;
  
  }
  
  // Check is session correct
  if(typeof(req.query.session) == 'undefined' || req.query.session.length != 32 || !(/^[0-9A-Fa-f]+$/.test(req.query.session))) {
  
    // Return ERR code
    returnAPIerror(req, res, { code: 400, message: 'Session incorrect' });
    
    // Exit
    return;
  
  }
  
  // Get session info
  redisClient.get('rhcs:sessions:' + req.query.session, function (err, data) {
  
    // Catch errors
    if(err) {

      // Log
      log.error('Redis ' + err.message);

      // Return error code
      res.status(500);
      res.json({ code: 500, error: 'Internal Server Error' });

      // Exit
      return;

    }
    
    // Session not exist
    if(!data) {
    
      // Return ERR code
      returnAPIerror(req, res, { code: 403, message: 'Session invalid' });
      
      // Exit
      return;
    
    }
    
    // If session exists - get info about user
    redisClient.get('rhcs:users:' + req.params.username, function (err, data) {
    
      // Catch errors
      if(err) {

        // Log
        log.error('Redis ' + err.message);

        // Return ERR code
        res.status(500);
        res.json({ code: 500, error: 'Internal Server Error' });

        // Exit
        return;

      }
      
      // User not exists
      if(!data) {
      
        // Return ERR code
        returnAPIerror(req, res, { code: 404, message: 'User not found' });
        
        // Exit
        return;
      
      }
      
      // Parse JSON data
      data = JSON.parse(data);
      
      // Prepare and return user data
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

})

/** 
 * Users.DELETE - Delete user
 * @require: Username, Session
 * @return: none
 */
.delete(function (req, req) {

  // Check input data
  

});