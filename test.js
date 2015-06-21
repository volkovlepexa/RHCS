var u = require('./system/core/users.js');

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

// TLS configuration
global['indigoConfiguration'].httpsConfiguration = {};


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
  
  // DB seems like to be correct
  else {
    
    // Notify
    console.info('Successfull connected to Redis DB');
    
    // Exit
    return;
    
  }

});

u.validateSessionAction('12345678aaaabbbbccccddddeeeeffff', function (state) {

  console.log(state);

});