/*

  RHCS.System.Core.Server_Init.js
  @version: 0.7.4;
  @author: Dmitriy <CatWhoCode> Nogay;
  
  This module initialize HTTP & HTTPS Servers with Express
  Need to be required() not as exportable module.
  Factory-pattern module

*/

module.exports = function (mag, indigo, fs, configuration) {

  // Attach logger
  var log = mag('ServerFactory');
  
  // Load TLS cert & key
  log.debug('Begin initialization HTTP and HTTPS servers..');

  // TLS Key
  try {
  
    log.debug('Reading TLS data..');
    var tlsData = {};
    tlsData.cert = fs.readFileSync('./system/data/tls/tls.crt');
    tlsData.key = fs.readFileSync('./system/data/tls/tls.key');
    
    log.debug("Creating HTTPS server..");

    // securedServer - Server with encryption (default port: 1385)
    securedServer = require('https').createServer(tlsData, indigo);
    securedServer.listen(configuration.indigoWebserverPorts.httpsPort);

  } catch (e) {

    // Log error
    log.error("CRITICAL - HTTPS SERVER ERROR");
    log.error("Error: ", e.message);
    
    // Message
    console.log("\n************************************************");
    console.log("** Indigo now working only on HTTP connection **");
    console.log("**   Immediantly check your HTTPS settings    **");
    console.log("************************************************\n");

  }
  
  log.debug("Creating HTTP server..");

  // plainServer - Server with encryption (default port: 1384)
  plainServer = require('http').createServer(indigo);
  plainServer.listen(configuration.indigoWebserverPorts.httpPort);

}