var xbee = require('../system/core/providers/xbee_provider.js');

var xBee = xbee.xbee('/dev/ttyUSB1'); 

xBee.on('packet', function (packet) {

  console.log(packet);

});

//setInterval(function () { xBee.emit('push_packet', 'F3FFFF:IDENTIFY:'); }, 1500);