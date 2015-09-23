/*

  Примитивный термостат (для платформы на базе Uno + xBee).
  Написан в спешке на Робофинисте, но по-моему тут нечего править.
  Разве только что убрать таймауты, но тогда блок скорее всего не будет
  успевать реагировать на команды.
  
  @catwhocode // 20 Sep 2015
  
  @bug: Иногда, входящий пакет парсится некорректно, и мы получаем некорректную температуру (пример: :0, вместо 27.0).

*/

var xBee = require('../system/core/providers/xbee_provider.js').xbee('/dev/ttyUSB0');
var celestia = require('../system/core/providers/celestia_provider.js');
var log = require('mag')('Thermostate');

// Target temperature
var targetTemperature = 27;

// Request for actual temperature
setInterval(function () {

  // Send broadcast REQ packet
  xBee.emit('push_packet', 'F3FFFF:GETTEMP:');
  
}, 10000);


// We have incomming transmission
xBee.on('packet', function (packet) {

  // Drop this packet into console
  log.debug('xBee RX packet: ' + packet);
  
  // Check, is this packet contains temperature values
  if(packet.indexOf('TCHP') > -1) {
  
    // Example payload: 09A38D:TCHP:30.00:32.00:
    
    // Get current temperature
    var currentTemperature = packet.substring(12, 15) + 0;
    
    // Log it
    log.debug("Current temperature: " + currentTemperature);
    
    // Compare data
    if(currentTemperature < targetTemperature) {
    
      // Heater required
      log.debug('Target mode: Heating');
      
      // Switch on heater
      xBee.emit('push_packet', '09A38D:DWRITEXOR:4:1:');
      setTimeout(function () { xBee.emit('push_packet', '09A38D:DWRITEXOR:5:0:') }, 2500);
    
    }
    
    else if(currentTemperature > targetTemperature) {
    
      // Cooler required
      log.debug('Target mode: Cooling');

      // Switch on cooler
      xBee.emit('push_packet', '09A38D:DWRITEXOR:5:1:');
      setTimeout(function () { xBee.emit('push_packet', '09A38D:DWRITEXOR:4:0:'); }, 2500);
    
    }
    
    else if(currentTemperature == targetTemperature) {
    
      log.debug('Target accomplished');
      setTimeout(function () { xBee.emit('push_packet', '09A38D:DWRITEXOR:5:0:'); }, 2500);
      xBee.emit('push_packet', '09A38D:DWRITEXOR:4:0:');
    
    }
  
  }

});