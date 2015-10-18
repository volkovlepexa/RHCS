/*

  RHCS.System.Core.Server_Init.js
  @version: 0.7.4;
  @author: Dmitriy <CatWhoCode> Nogay;

  This module initialize HTTP & HTTPS Servers with Express
  Need to be required() not as exportable module.
  Factory-pattern module

*/

// Attach logger
var log = require('mag')('ServerFactory');
  
// Load modules
var fs = require('fs');
var configuration = require('../configuration.js');
  
// Initialize Indigo server
var indigo = require('express')();

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
  
// Return data
if(configuration.httpServer.enabled && configuration.httpsServer.enabled)  {
    
  // Export all pointers
  module.exports.indigo = indigo;
  module.exports.plainServer = plainServer;
  module.exports.securedServer = securedServer;
    
  // Exit
  return;
    
}
  
else if(configuration.httpServer.enabled && !configuration.httpsServer.enabled) {
    
  // Export indigo and http server
  module.exports.indigo = indigo;
  module.exports.plainServer = plainServer;

  // Exit
  return;
    
}
  
else if(configuration.httpsServer.enabled && !configuration.httpsServer.enabled) {
    
  // Export indigo and http server
  module.exports.indigo = indigo;
  module.exports.securedServer = securedServer;

  // Exit
  return;
    
}