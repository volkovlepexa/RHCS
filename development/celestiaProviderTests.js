var celestia = require('../system/core/providers/celestia_provider.js');

function myLovelyDebugger(err, data) {

  if(err) {

    // If we had strange error type (not our custom AuthenticationError)
    if(typeof(err.name) == 'undefined' || err.name != "IndigoError") { console.trace("Invalid error type");  return; }

    // If we have correct error
    console.trace("Error " + err.errorCode + ": " + err.message);
    return;

  }

  console.log("Success!");
  console.log(data);

}

//celestia.gpio.dwrite('celone', 13, 0, function (err, data) { myLovelyDebugger(err, data) });
//celestia.gpio.awrite('celone', 3, 0, function (err, data) { myLovelyDebugger(err, data) });

//celestia.gpio.aread('celone', 2, function (err, data) { myLovelyDebugger(err, data) });
//celestia.gpio.dread('celone', 22, function (err, data) { myLovelyDebugger(err, data) });

//celestia.dht.read('celone', 36, 11, function (err, data) { myLovelyDebugger(err, data); });
//celestia.ow.discovery('celone', 29, function (err, data) { myLovelyDebugger(err, data); });
//console.log(celestia.ow.convertAddress(["0x28", "0xb1", "0xcf", "0xd7", "0x02", "0x00", "0x00", "0xab"]));

//celestia.ow.readDS18B20('celone', 29, celestia.ow.convertAddress(["0x28", "0x2a", "0xc9", "0xe4", "0x04", "0x00", "0x00", "0x6f"]), function (err, data) {myLovelyDebugger(err, data); });

//celestia.servo.rotateServo('celone', 0, 0, function (err, data) { myLovelyDebugger(err, data); });

celestia.ledStripe.setColor('celone', 1, { red: 16, green: 150, blue: 61 }, function (err, data) { myLovelyDebugger(err, data); });
celestia.ledStripe.setColor('celone', 2, { red: 210, green: 30, blue: 150 }, function (err, data) { myLovelyDebugger(err, data); });