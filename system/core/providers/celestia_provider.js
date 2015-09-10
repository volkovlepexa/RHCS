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
      OWCONVERTADDRESS
      
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

var ow = {};

/**
 * OW.Discovery - Discovery 1-Wire bus
 * @param   {String}   deviceName Device name
 * @param   {Integer}  pinNumber  Bus pin
 * @returns {Function} Callback
 */

ow.discovery = function (deviceName, pinNumber, callback) {

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
    superagent.get('http://' + data.ip + '/' + data.password + '::OW:' + pinNumber + ':DISCOVERY').end(function (err, res) {

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

        // Fix bug in 0.7.3
        if(res.text[res.text.length - 3] == ",") { res.text[res.text.length - 3] = ""; }
        
        // Parse data from Celestia
        var celestiaData = JSON.parse(res.text);

        // Get code
        if(celestiaData.code == 200) {

          // Return successfull callback 
          return callback(undefined, { code: 200, devices: celestiaData.devices });

        }

        // Return error (if error :3)
        return callback(new indigoError({ message: 'Received error code from device', errorCode: celestiaData.code }));

      }

    });

  });

}

/**
 * OW.ConvertAddress - Convert HEX address to DEC
 * @param   {Array} address Device address in HEX
 * @returns {Array} Device address in DEC
 */

ow.convertAddress = function (address) {

  // Check input data
  if(typeof(address) !== 'object' || address.length != 8) {
  
    // Return nothing
    return;
  
  }
  
  // DEC
  var decAddress = [];
  
  // Convert
  address.forEach(function(item, number) { decAddress[number] = parseInt(item, 16); });
  
  // Return
  return decAddress;

}

/**
 * OW.ReadDS18B20 - Read DS18B20
 * @param   {String}   deviceName    Device name
 * @param   {Integer}  pinNumber     1-Wire bus pin
 * @param   {Array}    deviceAddress Array with sensor address
 * @param   {Function} callback      Callback
 * @returns {Function} Callback
 */

ow.readDS18B20 = function(deviceName, pinNumber, deviceAddress, callback) {

  // Check input values
  if(deviceName.length < 3 || !(/^[\w.@]+$/).test(deviceName)) {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect device name', errorCode: 400 }));

  }

  // Check port and value
  if(typeof(pinNumber) != 'number') {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect pin', errorCode: 400 }));

  }

  // Check sensor type
  if(typeof(deviceAddress) !== 'object' || deviceAddress.length != 8) {

    // Return error callback
    return callback(new indigoError({ message: 'Invalid device address', errorCode: 400 }));

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

    // Build request
    var owRequest = "::OW:" + pinNumber + ":RDS18B20" + ":";
    deviceAddress.forEach(function (item, number) { owRequest += item + ":"; });
    owRequest = owRequest.substr(0, owRequest.length - 1);
    
    // Make request
    superagent.get('http://' + data.ip + '/' + data.password + owRequest).end(function (err, res) {

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
          return callback(undefined, { temperature: celestiaData.temp });

        }

        // Return error (if error :3)
        return callback(new indigoError({ message: 'Received error code from device', errorCode: celestiaData.code }));

      }

    });

  });

}

var servo = {};

/**
 * Servo.rotateServo - Rotate defined servo
 * @param   {String}   deviceName Device name
 * @param   {Integer}  servoID    Servo identifier
 * @param   {Integer}  servoAngle Servo rotation angle
 * @param   {Function} callback   Callback
 * @returns {Function} Callback
 */

servo.rotateServo = function(deviceName, servoID, servoAngle, callback) {

  // Check input values
  if(deviceName.length < 3 || !(/^[\w.@]+$/).test(deviceName)) {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect device name', errorCode: 400 }));

  }

  // Check port and value
  if(typeof(servoID) != 'number') {

    // Return error callback
    return callback(new indigoError({ message: 'Incorrect servo identifier', errorCode: 400 }));

  }

  // Check sensor type
  if(typeof(servoAngle) != 'number' || servoAngle < 0) {

    // Return error callback
    return callback(new indigoError({ message: 'Invalid servo angle', errorCode: 400 }));

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
    superagent.get('http://' + data.ip + '/' + data.password + '::ROTATESERVO:' + servoID + ':' + servoAngle).end(function (err, res) {

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
          return callback(undefined, { code: 200 });

        }

        // Return error (if error :3)
        return callback(new indigoError({ message: 'Received error code from device', errorCode: celestiaData.code }));

      }

    });

  });

};

module.exports.gpio = gpio;
module.exports.dht = dht;
module.exports.ow = ow;
module.exports.servo = servo;