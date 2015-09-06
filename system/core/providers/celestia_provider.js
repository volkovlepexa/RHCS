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
  if(typeof(pinNumber) != 'number' || typeof(pinValue) != 'number' || pinValue < 0 || pinValue > 1 ) {
     
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
    superagent.get('http://' + data.ip + '/' + data.password + '::GPIO:' + pinNumber + ':SET:' + pinValue).end(function (err, res) {
    
      // Error
      if(err){
        
        // Catch timeout error
        if(err.timeout) {
      
          // Return error callback
          return callback(new indigoError({ message: 'Device unresponsible', errorCode: 503 }));
      
        }
      
        else if(err) {
      
          // Return error callback
          return callback(new indigoError({ message: err, errorCode: 400 }));
      
        }
        
      }
      
      else {
      
        // Parse data from Celestia
        var celestiaData = JSON.parse(res.text);
          
        // Get code
        if(celestiaData.code == 200) {
        
          // Return successfull callback 
          return callback(undefined, { code: celestiaData.code });
        
        }
        
        // Return error (if error :3)
        return callback(new indigoError({ message: 'Received error code from device', errorCode: celestiaData.code }));
      
      }
    
    });
  
  });

}

/**
 * GPIO.AWrite - Analog Write
 * @param   {String} deviceName Device name
 * @param   {Integer} pinNumber Arduino pin number
 * @param   {Integer} pinValue  New pin value
 * @returns {Function} Callback
 */
gpio.awrite = function (deviceName, pinNumber, pinValue, callback) {

  // Check input values
  if(deviceName.length < 3 || !(/^[\w.@]+$/).test(deviceName)) {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect device name', errorCode: 400 }));

  }

  // Check port and value
  if((pinValue < 0 || pinValue > 255) ) {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect port or PWM duty', errorCode: 400 }));

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
    superagent.get('http://' + data.ip + '/' + data.password + '::GPIO:' + pinNumber + ':SPWM:' + pinValue).end(function (err, res) {

      // Error detected
      if(err) {
        
        // Catch timeout error
        if(err.timeout) {

          // Return error callback
          return callback(new indigoError({ message: 'Device unresponsible', errorCode: 503 }));

        }

        else if(err) {

          // Return error callback
          return callback(new indigoError({ message: err, errorCode: 400 }));

        }
      
      }

      else {

        // Parse data from Celestia
        var celestiaData = JSON.parse(res.text);

        // Get code
        if(celestiaData.code == 200) {

          // Return successfull callback 
          return callback(undefined, { code: celestiaData.code });

        }

        // Return error (if error :3)
        return callback(new indigoError({ message: 'Received error code from device', errorCode: celestiaData.code }));

      }

    });

  });

}

/**
 * GPIO.DRead - Digital Read
 * @param   {String} deviceName Device name
 * @param   {Integer} pinNumber Arduino pin number
 * @returns {Function} Callback
 */
gpio.dread = function (deviceName, pinNumber, callback) {

  // Check input values
  if(deviceName.length < 3 || !(/^[\w.@]+$/).test(deviceName)) {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect device name', errorCode: 400 }));

  }

  // Check port and value
  if(typeof(pinNumber) != 'number') {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect port', errorCode: 400 }));

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
    superagent.get('http://' + data.ip + '/' + data.password + '::GPIO:' + pinNumber + ':DREAD').end(function (err, res) {

      // Error detected
      if(err) {

        // Catch timeout error
        if(err.timeout) {

          // Return error callback
          return callback(new indigoError({ message: 'Device unresponsible', errorCode: 503 }));

        }

        else if(err) {

          // Return error callback
          return callback(new indigoError({ message: err, errorCode: 400 }));

        }

      }

      else {

        // Parse data from Celestia
        var celestiaData = JSON.parse(res.text);

        // Get code
        if(celestiaData.code == 200) {

          // Return successfull callback 
          return callback(undefined, { code: celestiaData.code, value: celestiaData.value });

        }

        // Return error (if error :3)
        return callback(new indigoError({ message: 'Received error code from device', errorCode: celestiaData.code }));

      }

    });

  });

}

/**
 * GPIO.ARead - Analog Read
 * @param   {String} deviceName Device name
 * @param   {Integer} pinNumber Arduino pin number
 * @returns {Function} Callback
 */
gpio.aread = function (deviceName, pinNumber, callback) {

  // Check input values
  if(deviceName.length < 3 || !(/^[\w.@]+$/).test(deviceName)) {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect device name', errorCode: 400 }));

  }

  // Check port and value
  if(typeof(pinNumber) != 'number') {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect port', errorCode: 400 }));

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
    superagent.get('http://' + data.ip + '/' + data.password + '::GPIO:' + pinNumber + ':ADC').end(function (err, res) {

      // Error detected
      if(err) {

        // Catch timeout error
        if(err.timeout) {

          // Return error callback
          return callback(new indigoError({ message: 'Device unresponsible', errorCode: 503 }));

        }

        else if(err) {

          // Return error callback
          return callback(new indigoError({ message: err, errorCode: 400 }));

        }

      }

      else {

        // Parse data from Celestia
        var celestiaData = JSON.parse(res.text);

        // Get code
        if(celestiaData.code == 200) {

          // Return successfull callback 
          return callback(undefined, { code: celestiaData.code, value: celestiaData.value });

        }

        // Return error (if error :3)
        return callback(new indigoError({ message: 'Received error code from device', errorCode: celestiaData.code }));

      }

    });

  });

}


var dht = {};

/**
 * DHT.Read - DHT Sensor Read
 * @param   {String} deviceName   Device name
 * @param   {Integer} pinNumber   Arduino pin number
 * @param   {Integer} sensorModel DHT sensor model ( 11 / 21 / 22 )
 * @returns {Function} Callback
 */

dht.read = function (deviceName, pinNumber, sensorModel, callback) {

  // Check input values
  if(deviceName.length < 3 || !(/^[\w.@]+$/).test(deviceName)) {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect device name', errorCode: 400 }));

  }

  // Check port and value
  if(typeof(pinNumber) != 'number') {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect port', errorCode: 400 }));

  }
  
  // Check sensor type
  if(sensorModel != 11 && sensorModel != 21 && sensorModel != 22) {
  
    // Return error callback
    return callback(new indigoError({ message: 'Invalid sensor model', errorCode: 400 }));
  
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
    superagent.get('http://' + data.ip + '/' + data.password + '::DHT:' + pinNumber + ':' + sensorModel).end(function (err, res) {

      // Error detected
      if(err) {

        // Catch timeout error
        if(err.timeout) {

          // Return error callback
          return callback(new indigoError({ message: 'Device unresponsible', errorCode: 503 }));

        }

        else if(err) {

          // Return error callback
          return callback(new indigoError({ message: err, errorCode: 400 }));

        }

      }

      else {

        // Parse data from Celestia
        var celestiaData = JSON.parse(res.text);

        // Get code
        if(celestiaData.code == 200) {

          // Return successfull callback 
          return callback(undefined, { temperature: celestiaData.tc, humidity: celestiaData.hp });

        }

        // Return error (if error :3)
        return callback(new indigoError({ message: 'Received error code from device', errorCode: celestiaData.code }));

      }

    });

  });

}

module.exports.gpio = gpio;
module.exports.dht = dht;