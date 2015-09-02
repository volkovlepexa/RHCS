/*

  RHCS.System.Core.Providers.Celestia_Provider.js
  @version: 0.7.4;
  @author: Dmitriy <CatWhoCode> Nogay;

  RHCS Celestia API Bridge

*/

/*

  Struct::Celestia
  
    GPIO
      DWrite
      DRead
      AWrite
      ARead
      
    DHT
      DHTRead
      
    OW
      OWDS18B20
      OWDISCOVERY
      
    SYS
      IDENTIFY
      FLUSH
      
  AltStruct::CelestiaGET
  
    

*/

// Require some modules
var redisClient = require('../redisFactory.js');
var indigoError = require('../particles/indigoError.js');
var superagent  = require('superagent') ;

// GPIO
var gpio = {};

/**
 * GPIO.DWrite - Digital Write
 * @param   {String} deviceName Device name
 * @param   {Integer} pinNumber Arduino pin number
 * @param   {Integer} pinValue  New pin value
 * @returns {Function} Callback
 */
gpio.dwrite = function (deviceName, pinNumber, pinValue, callback) {

  // Check input values
  if(deviceName.length < 3 || !(/^[\w.@]+$/).test(deviceName)) {
  
    // Return error callback
    return callback(new indigoError({ message: 'Incorrect device name', errorCode: 400 }));
  
  }
  
  // Check port and value
  if(typeof(pinNumber) != 'integer' || typeof(pinValue) != 'integer' || (pinValue === 0 || pinValue === 1) ) {
     
    // Return error callback
    return callback(new indigoError({ message: 'Incorrect port or state', errorCode: 400 }));
     
  }
  
  // Get device data from DB
  redisClient.get('rhcs:devices:' + deviceName, function (err, data) {
  
    // Catch error
    if(err) {
    
      // Log it
      log.error('Redis ' + err);
      
      // Return error callback
      return callback(new indigoError({ message: err, errorCode: 500 }));
    
    }
    
    // Device not exists
    if(!data) {
    
      // Return error callback
      return callback(new indigoError({ message: 'Device not exists', errorCode: 404 }));
    
    }
    
    // Device exists
    // Parse JSON from DB
    data = JSON.parse(data);
    
    // Make request
    superagent.get('http://' + data.ip + '/' + data.password + '::GPIO' + pinNumber + ':SET:' + pinValue).end(function (err, data) {
    
      // Catch timeout error
      if(err.timeout) {
      
        // Return error callback
        return callback(new indigoError({ message: 'Device unresponsible', errorCode: 503 }));
      
      }
      
      else if(err) {
      
        // Return error callback
        return callback(new indigoError({ message: err, errorCode: 400 }));
      
      }
      
      else {
      
        /* parse data & return callback */
      
      }
    
    });
  
  });

}
