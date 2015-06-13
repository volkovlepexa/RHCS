var dp = require('./system/core/dataprovider.js');
var cfg = require('./system/core/configuration.js');

dp.wundergroundParser(function(e){ console.log(e.data.wind.speed); }, cfg.wundergroundAPIData );
dp.cbrfParser(function (e) { console.log(e.currencyRate); })