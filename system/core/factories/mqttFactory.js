/*

  MQTT Provider for RHCS Indigo
  @version: 0.7.5;
  @author: Dmitriy <CatWhoCode> Nogay;

  This module initialize HTTP & HTTPS Servers with Express
  Need to be required() not as exportable module.
  Factory-pattern module

*/

// Attach logger
var log = require('mag')('MQTTFactory');

// Load modules
var fs = require('fs');
var configuration = require('../configuration.js');

// Load MQTT module
var mqtt = require('mqtt');

// Build URL
var mqttURL = "mqtt://";

// Is authentication required?
if(configuration.mqttConnection.authRequired) {

  mqttURL += configuration.mqttConnection.username + ':'
          + configuration.mqttConnection.password + '@';

}

// Hostname and port
mqttURL += configuration.mqttConnection.hostname + ':' + configuration.mqttConnection.port;

// Log result
if(!configuration.mqttConnection.authRequired) {

  log.debug('Connecting to: ' + configuration.mqttConnection.hostname + ':' + configuration.mqttConnection.port + ' (as anonymous)');

} else {

  log.debug(
    'Connecting to: ' + configuration.mqttConnection.hostname + ':'
    + configuration.mqttConnection.port + ' (as "'
    + configuration.mqttConnection.username
    + '")'
  );

}

// Attempt to connect
var mqttClient = mqtt.connect(mqttURL);

// Export mqttClient as general module object
module.exports = mqttClient;

// Error catcher
mqttClient.on('error', function (error) {

  // Log
  log.error('Catched error:', error);

});

// Connect notificator
mqttClient.on('connect', function () {

  // Log
  log.debug('Successfull connected');

});

// Reconnect notificatior
mqttClient.on('reconnect', function () {

  // Log
  log.warn('Reconnecting to MQTT broker');

});
