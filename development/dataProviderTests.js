var dataProvider = require('../system/core/providers/data_provider.js');
var configuration = require('../system/core/configuration.js');

dataProvider.wundergroundParser(configuration.wundergroundAPIData, function (err, data) {

  // Error
  if(err) { throw err; }
  
  // Print received data
  console.log(data);

});

dataProvider.cbrfParser(function (err, data) { 

  // Error
  if(err) { throw err; }
  
  // Print data
  console.log(data) 

});