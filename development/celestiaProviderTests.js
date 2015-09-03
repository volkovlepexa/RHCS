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
//celestia.gpio.awrite('celone', 13, 0, function (err, data) { myLovelyDebugger(err, data) });

//celestia.gpio.aread('celone', 2, function (err, data) { myLovelyDebugger(err, data) });
//celestia.gpio.dread('celone', 22, function (err, data) { myLovelyDebugger(err, data) });

//celestia.dht.read('celone', 34, 22, function (err, data) { myLovelyDebugger(err, data); });