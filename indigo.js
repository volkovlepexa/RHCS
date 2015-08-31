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
var path = require('path');
var fs = require('fs');

// Attach logger
var mag = require('mag');
var log = mag('Indigo');

// Hello World
log.info("RHCS Indigo v0.7.4 Laughing Bear");
log.info("Bootstrapping..");

// Load configuration
var configuration = require('./system/core/configuration.js');
var userProvider = require('./system/core/providers/user_provider.js');

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

// Attach Users API Module
var userAPIModule = require('./system/core/api_routers/api_user.js');

// Indigo Routing
var indigoAPIRouter = express.Router();
var indigoPagesRouter = express.Router();
indigo.use('/api/v1', indigoAPIRouter);

// Redir from root
indigo.get('/', function (req, res) {

  // Check session existing
  if(typeof(req.cookies.rhcsSession) == 'undefined') { res.redirect('/page/auth'); return; }
  else { res.redirect('/page/main'); return; }

});

// Pages
indigo.get('/page/:page', function (req, res) {

  // Fix updir vunerability
  var pageName = path.basename(req.params.page);
  
  // Page: logout
  if(pageName == 'logout') {
  
    // Check cookie
    if(typeof(req.cookies.rhcsSession) == 'undefined') {
    
      // Log this
      log.warn('Attempt to logout without session from ' + req.connection.remoteAddress);
      
      // Redirect to auth page
      res.redirect('/page/auth');
      
      // Exit
      return;
    
    }
    
    // Length & regexp check
    if(req.cookies.rhcsSession.length != 32 || !(/^[0-9A-Fa-f]+$/).test(req.cookies.rhcsSession)) {

      // Log this
      log.warn('Attempt to logout with incorrect session from ' + req.connection.remoteAddress);

      // Clear cookie and redirect
      res.clearCookie('rhcsSession', { path: '/' });
      res.redirect('/page/auth');

      // Exit
      return;

    }
    
    userProvider.deauthenticateSession(req.cookies.rhcsSession, function (err, data) {
      
      // Catch error
      if(err) {
      
        // Check, is it 500 error
        if(err.errorCode == 500) {
        
          // Return error
          res.status(500);
          res.json({ code: 500, description: 'Internal Server Error. Please check your log file immediantly' });
        
        }
        
        else {

          // Remove session
          res.clearCookie('rhcsSession', { path: '/' });
          
          // Redirect to /
          res.redirect('/page/auth');
        
        }
        
        // Log error
        log.warn('Error ' + err.message + ' from ' + req.connection.remoteAddress);
        
        // Exit
        return;
      
      }
      
      // Remove session
      res.clearCookie('rhcsSession', { path: '/' });

      // Redirect to /
      res.redirect('/page/auth');
      
      // Exit
      return;
    
    });
  
  }
  
  // Page: auth
  else if(pageName == 'auth') {
  
    // Switcher variable
    var authPageName = 'auth';
    
    // Check session existing
    if(typeof(req.cookies.rhcsSession) != 'undefined') {
      
      // Log this
      log.warn('Attempt to authenticate with existing session from ' + req.connection.remoteAddress);
      
      // Use another auth page
      authPageName = 'auth_notification';
    
    }
      
    // Show page content
    res.sendFile('./system/template/' + authPageName + '.html', configuration.rootDirectory, function (err) {
    
    // Catch error
    if(err) {
        
      // Log error
      log.error(err + ' from ' + req.connection.remoteAddress);
      
      // Send error
      res.send('<!doctype html><head><title>Error 404</title></head><h2>Page not found</h2><p>Page that you requested not found on server. You can <a href="/page/main">go back to main page</a></p>');
      
    }
      
    // Exit
    return;
    
    });
      
  }
  
  // Another page
  else {
  
    // Check session
    if(typeof(req.cookies.rhcsSession) == 'undefined') {

      // Log this
      log.warn('Attempt to get page without session from ' + req.connection.remoteAddress);

      // Redirect to /page/auth
      res.redirect('/page/auth');

      // Exit
      return;

    }

    if(req.cookies.rhcsSession.length != 32 || !(/^[0-9A-Fa-f]+$/).test(req.cookies.rhcsSession)) {

      // Log this
      log.warn('Attempt to get page with incorrect session from ' + req.connection.remoteAddress);

      // Redirect to /page/auth
      res.redirect('/page/logout');

      // Exit
      return;

    }

    // Attempt to validate session
    userProvider.getSessionInformation(req.cookies.rhcsSession, function (err, data) {

      // Catch error
      if(err) {

        // Log this
        log.warn('Error ' + err.message + ' from ' + req.connection.remoteAddress);

        // Catch ISE
        if(err.errorCode == 500) {

          // Return error
          res.status(500);
          res.json({ code: 500, description: 'Internal Server Error. Check your log file immediantly' });

        } else {

          // Redirect to logout page
          res.redirect('/page/logout');

        }

        // Exit
        return

      }

      // Load page
      res.sendFile('./system/template/' + pageName + '.html', configuration.rootDirectory, function (err) {

        // Catch error
        if(err) {

          // Log this
          log.error(err + ' from ' + req.connection.remoteAddress);

          // Return 404 errpr
          res.status(404);
          res.send('<!doctype html><head><title>Error 404</title></head><h2>Page not found</h2><p>Page that you requested not found on server. You can <a href="/page/main">go back to main page</a></p>');

        }

        // Exit
        return;

      });

    });
  
  }
  
});

// API routes
indigoAPIRouter.route('/users/:username')
  .get(userAPIModule.userGET)
  .post(userAPIModule.userPOST)
  .delete(userAPIModule.userDELETE)
  .put(userAPIModule.userPUT);

indigoAPIRouter.route('/sessions/:session')
  .get(userAPIModule.sessionGET)
  .delete(userAPIModule.sessionDELETE);

indigoAPIRouter.route('/sessions/')
  .put(userAPIModule.sessionPUT);