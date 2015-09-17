var dp = require('../system/core/providers/data_provider.js');
var conf = require('../system/core/configuration.js');

//dp.cbrfParser(function (err, data) { console.log(data); });
dp.wundergroundParser(conf.wundergroundAPIData, function (err, data) { console.log(data); });