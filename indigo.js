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

// Indigo Main Router
var indigoRouter = express.Router();
indigo.use('/api/v1', indigoRouter);

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
.delete(function (req, res) {

  // Send error
  res.status(400);
  res.json({ code: 400, error: 'Session not defined' });
  
  // Exit
  return;

})

// Catch GET error
.get(function (req, res) {

  // Send error
  res.status(400);
  res.json({ code: 400, error: 'Session not defined' });

  // Exit
  return;
  
});

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