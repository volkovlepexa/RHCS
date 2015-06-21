/**
 * Indigo Scheduler - RHCS Scheduler
 * @author: Dmitriy <CatWhoCode> Nogay;
 * @version: 0.7.4 Laughing Bear;
 */

// System configuration
global['indigoConfiguration'] = require('./system/core/configuration.js');

// Connect to Redis
global['indigoRedis'] = require('redis').createClient(global['indigoConfiguration'].redis.port, global['indigoConfiguration'].redis.host);

// Redis Error catcher
global['indigoRedis'].on('error', function (err) {

  // Log error entity
  console.warn("Redis " + err);
 
  // Kill Node if error
  throw err;

});

// Redis authentication
if(global['indigoConfiguration'].redis.usePassword) { global['indigoRedis'].auth(global['indigoConfiguration'].redis.password); }

// Select database (default: 0)
global['indigoRedis'].select(global['indigoConfiguration'].redis.dbIndex, function() { return; });

// Simplest db check
global['indigoRedis'].get('foo', function (err, data) {

  // If error
  if(err) {
    
    // Log this
    console.warn(err);

    // Shutdown Indigo with error
    process.exit(1);
  
  }

  // Check db test value (foo == bar)
  if(data !== 'bar') {

    // Log this
    console.warn("Redis database doesn't contain correct validation value (foo)");

    // Shutdown Indigo with error
    process.exit(1);

  }

});


// Update currency rate
if(process.argv[2] === 'start' && process.argv[3] === 'updateCurrencyRate') {

  // Connect module
  var dataprovider = require('./system/core/dataprovider.js');
  
  dataprovider.cbrfParser(function (data) {
  
    // Error catch
    if(data.code != 200) { throw data.error; }
    
    var currencyRate = {
    
      usd: data.currencyRate.USD,
      eur: data.currencyRate.EUR
      
    };
    
    // Debug into STDOUT
    console.log(JSON.stringify(currencyRate));
    
    // Save to Redis
    global['indigoRedis'].set('rhcs:provided_data:currencyRate', JSON.stringify(currencyRate));
		global['indigoRedis'].hset('rhcs:timeWidget', 'currencyRates', JSON.stringify(
			{ 
			  
				usd: currencyRate.usd,
				eur: currencyRate.eur
				
			}
		));
    
    // Exit
    process.exit(0);
  
  });
  
}

// Update current weather
else if(process.argv[2] === 'start' && process.argv[3] === 'updateWeatherConditions') {

  // Connect module
  var dataprovider = require('./system/core/dataprovider.js');
  
  dataprovider.wundergroundParser(function (data) {
  
    // Error catch
    if(data.code != 200) { throw data.error; }
    
    // Debug into STDOUT
    console.log(JSON.stringify(data));
    
    // Save to Redis
    global['indigoRedis'].set('rhcs:provided_data:weatherConditions', JSON.stringify(data.data));
		global['indigoRedis'].hset('rhcs:timeWidget', 'weatherConditions', JSON.stringify(
			{
				
				temperature: data.data.temperature,
				humidity: data.data.humidity,
				pressure: data.data.pressure
				
			}
		));
    
    // Exit
    process.exit(0);
  
  }, global['indigoConfiguration'].wundergroundAPIData);
  
}

else {

  console.warn('Action not defined');
  process.exit(0);

}