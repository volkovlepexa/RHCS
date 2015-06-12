/**
 * Indigo - RHCS Server application
 * @author: Dmitriy <CatWhoCode> Nogay;
 * @version: 0.7.4 Laughing Bear;
 */

/* @FIXME: Придумать стиль для комментирования, и переписать все комментарии */

// == Modules load
var fs = require('fs');
var path = require('path');
var express = require('express');
var logger = require('mag')('Indigo');
var cookieParser = require('cookie-parser');

// == Say hello
logger.info("RHCS Indigo v0.7.4 Laughing Bear");
logger.info("Hello World");

// == Load configuration
global['indigoConfiguration'] = require('./system/core/configuration.js');

// == Initalize Redis
global['indigoRedis'] = require('redis').createClient(global['indigoConfiguration'].redis.port, global['indigoConfiguration'].redis.host);

// Redis Error catcher
global['indigoRedis'].on('error', function (err) {

  // Log error entity
  logger.warn("Redis " + err);
 
  // Kill Node if error
  throw err;

});

// Authenticate us, if we need it
if(global['indigoConfiguration'].redis.usePassword) { global['indigoRedis'].auth(global['indigoConfiguration'].redis.password); }

// Select database (default: 0)
global['indigoRedis'].select(global['indigoConfiguration'].redis.dbIndex, function() { return; });

// Simplest db check
global['indigoRedis'].get('foo', function (err, data) {

  // If error
  if(err) {
    
    // Log this
    logger.warn(err);

    // Shutdown Indigo with error
    process.exit(1);
  
  }

  // Check value (foo == bar)
  if(data !== 'bar') {

    // Log this
    logger.warn("Redis database doesn't contain correct validation value (foo)");

    // Shutdown Indigo with error
    process.exit(1);

  }
  
  // DB seems like to be correct
  else {
    
    // Notify
    logger.debug('Successfull connected to Redis DB');
    
    // Exit
    return;
    
  }

});

// == Initalize server (HTTP & HTTPS)

// Init Indigo Application
var indigo = require('express')();

// Static data route
indigo.use('/assets', express.static('./system/template/assets'));

// Using cookie-parser module
indigo.use(cookieParser());

// securedServer - Server with encryption (default port: 1385)
var securedServer = require('https').createServer(global['indigoConfiguration'].httpsConfiguration, indigo);
securedServer.listen(global['indigoConfiguration'].serverPorts.httpsPort);

// securedServer - Server with encryption (default port: 1384)
var plainServer = require('http').createServer(indigo);
plainServer.listen(global['indigoConfiguration'].serverPorts.httpPort);

// Allow CORS in Indigo server
indigo.use(function(req, res, next) {
  
  // Allow CORS
  res.header("Access-Control-Allow-Origin", "*");
  
  // Allow CORS header
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  // Go to next handler
  next();
  
});

// IO - Socket.IO Server
global['indigoSocketIO'] = require('socket.io')(securedServer);

// Socket.IO API
global['indigoSocketIO'].on('connection', function (socket) {
  
  // ANCHOR RHCS.SOCKETIO.HANDLERS
  
});

// == Routing
indigo.get('/', function (req, res) {

  
  res.sendFile('system/template/dashboard.html', global['indigoConfiguration'].rootDirectory);
  // Redirect to main page
  //res.redirect('/page/main');

});
