/*

  RHCS.System.Core.Providers.XBee_Provider.js
  @version: 0.7.4;
  @author: Dmitriy <CatWhoCode> Nogay;

  RHCS Celestia UART-connected xBee bridge

*/

/*


  Struct: xBee_Provider
  
    Worker::EventEmitter
    
    sendXbeeCommand


*/

// Load modules
var EventEmitter = require('events').EventEmitter;
var serialPortModule = require('serialport').SerialPort;
var xBee = new EventEmitter();
var log = require('mag')('xBeeGateway');

var serialPort = {};

// Initialization
module.exports.xbee = function (serialPortName) {

  // If port not defined
  serialPortName = typeof serialPortName !== 'undefined' ? serialPortName : '/dev/ttyUSB0';
  
  // Attempt to connect to the defined serial port
  serialPort = new serialPortModule(serialPortName, {
  
    baudrate: 9600,
    databits: 8,
    parity: 'none',
    stopbits: 1
  
  });
  
  // Error event
  serialPort.on('error', function (err) {
  
    // Log this event
    log.error("Serial Port " + err);
    
    // Emit error
    xBee.emit('error', err);
    
    // Exit
    return;
  
  });
  
  // Close event
  serialPort.on('error', function () {

    // Log this event
    log.error("Serial Port was closed");

    // Exit
    return;

  });
  
  // Open event
  serialPort.on('open', function () {
  
    // Log this
    log.debug('Port successfull opened');
    
    // Exit
    return;
  
  });
  
  var serialDataBuffer = "";
  
  // Create listner
  serialPort.on('data', function (data) {
  
    // Convert buffer to string
    data = data.toString();
    
    // First time, we need to ignore this special character (replacement character 0xFFFD)
    if(data == '�') {
    
      // Exit
      return;
    
    }
    
    // If we have NewLine (\n) - this payload has been ended
    else if(data == '\n') {
    
      // Emit new event
      xBee.emit('packet', serialDataBuffer);
      
      // Clear buffer
      serialDataBuffer = "";
      
      // Exit
      return;
    
    }
    
    // Elsewhere (i think this word isn't exists, but anywhere [hah]), 
    // we just append to string buffer.
    else {
    
      // Append
      serialDataBuffer += data;
      
      // Exit
      return;
    
    }
  
  });
  
  // Return xBee EventEmitter
  return xBee;

}

// Push value
xBee.on('push_packet', function (data) {
  
  // Just send it
  serialPort.write(data + '\n', function (err) {
  
    // Error detected
    if(err) {
    
      // Log it
      log.error('Send packet ' + err);
      
      // Emit on error chanell
      xBee.emit('error', err);
      
      // Exit
      return;
    
    }
  
  });

});