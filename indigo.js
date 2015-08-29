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

// Attach Users API Module
var userAPIModule = require('./system/core/api_routers/api_user.js');

indigoRouter.route('/users/:username')
  .get(userAPIModule.userGET)
  .post(userAPIModule.userPOST)
  .delete(userAPIModule.userDELETE)
  .put(userAPIModule.userPUT);

indigoRouter.route('/sessions/:session')
  .get(userAPIModule.sessionGET)
  .delete(userAPIModule.sessionDELETE);

indigoRouter.route('/sessions/')
  .put(userAPIModule.sessionPUT);