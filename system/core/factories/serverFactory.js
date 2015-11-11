/*

  Server Factory Module for RHCS Indigo
  @version: 0.7.5;
  @author: Dmitriy <CatWhoCode> Nogay;

  This module initialize HTTP, HTTPS, and WSS Servers with Express
  Factory-pattern module

*/

// Attach logger
var log = require('mag')('ServerFactory');

// Load modules
var fs = require('fs');
var configuration = require('../configuration.js');

// Initialize Indigo server
var indigo = require('express')();

// Load express
var express = require('express');

// HTTP Server
if(configuration.httpServer.enabled) {

  // Log it
  log.debug('Begin initializing HTTP server on port ' + configuration.httpServer.port);

  // Try to start HTTP server
  try {

    // Create it
    var plainServer = require('http').createServer(indigo);

    // Create listner
    plainServer.listen(configuration.httpServer.port);

  } catch (e) {

    // Catch error
    if(e) {

      // Log error
      log.error(e);

      // Stop process
      process.exit(1);

    }

  }

  // Success
  log.debug('HTTP server successful started');

}

// HTTPS Server
if(configuration.httpsServer.enabled) {

  // Log it
  log.debug('Begin initializing HTTPS server on port ' + configuration.httpsServer.port);

  // Try to read TLS data
  var tlsData = {};

  try {

    // Log
    log.debug('Reading TLS data..');

    // Attempt to read TLS files
    tlsData.cert = fs.readFileSync(configuration.httpsServer.certificate.cert);
    tlsData.key = fs.readFileSync(configuration.httpsServer.certificate.key);

  } catch (e) {

    // Log error
    log.error(e);

    // Stop process
    process.exit(1);

  }

  // Successful TLS read
  log.debug('TLS data successful readed');

  // Try to start HTTPS server
  var securedServer = require('https').createServer(tlsData, indigo);

  try {

    // Log it
    log.debug("Creating HTTPS server..");

    // Create it
    securedServer = require('https').createServer(tlsData, indigo);
    securedServer.listen(configuration.httpsServer.port);

  } catch (e) {

    // Log error
    log.error(e);

    // Stop process
    process.exit(1);

  }

  // HTTPS server successful started
  log.debug('HTTPS server successful started');

}

// Define assets folder
indigo.use('/assets', express.static(configuration.webServer.assetsPath));

// Using cookie-parser module
// @FUTURE: Add HMAC signature for each cookie
indigo.use(require('cookie-parser')());

// Parse encoded URL
indigo.use(require('body-parser').urlencoded({ extended: false }));

// Allow CORS
indigo.use(function(req, res, next) {

  // Allow CORS
  res.header("Access-Control-Allow-Origin", "*");

  // Allow CORS header
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // Go to next handler
  return next();

});

// Use Jade
indigo.set('view engine', 'jade');
indigo.set('views', configuration.webServer.jadeViewsPath);

// Return data
if(configuration.httpServer.enabled && configuration.httpsServer.enabled)  {

  // Load Socket.io (WSS)
  var socketio = require('socket.io')(securedServer);

  // Export all pointers
  module.exports.indigo = indigo;
  module.exports.plainServer = plainServer;
  module.exports.securedServer = securedServer;
  module.exports.socketio = socketio;

  // Exit
  return;

}

else if(configuration.httpServer.enabled && !configuration.httpsServer.enabled) {

  // Load Socket.io (WS)
  var socketio = require('socket.io')(plainServer);

  // Export indigo and http server
  module.exports.indigo = indigo;
  module.exports.plainServer = plainServer;
  module.exports.socketio = socketio;

  // Exit
  return;

}

else if(configuration.httpsServer.enabled && !configuration.httpsServer.enabled) {

  // Load Socket.io (WS)
  var socketio = require('socket.io')(securedServer);

  // Export indigo and http server
  module.exports.indigo = indigo;
  module.exports.securedServer = securedServer;
  module.exports.socketio = socketio;

  // Exit
  return;

}
