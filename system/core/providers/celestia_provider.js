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

*/

// Require some modules
var redisClient = require('../redisFactory.js');
var indigoError = require('../particles/indigoError.js');

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
    //return callback(new );
  
  }

}
