/**

  Configuration file for RHCS Indigo

  @author: Dmitriy <CatWhoCode> Nogay;
  @version: 0.7.5;

*/

// Application folder
var configuration = {

  // System installation folder absolute path
  applicationFolder: "/mnt/Storage/Devworlds/RHCS/indigo"

};

// Configuration array
configuration = {

  // Database
  database: {

    // Relative or absolute path to database file
    file: configuration.applicationFolder + "/system/data/system.db",

    // Configuration for LokiJS
    lokiConfiguration: {

      // Enable autosave
      autosave: true,

      // Autosave interval (in milliseconds)
      autosaveInterval: 1000

    },

    // Collections, that will created in installation
    systemCollections: [ 'users', 'sessions', 'otp' ]

  },

  // Keys
  keys: {

    // HMAC-based cookie signing
    cookieSignSecret: '1718397ac384865b0074ecde5ddb0f50',

    // Pepper for password hashing
    pepper: 'b7bb31e2766d54da8cedb654553bae0e'

  },

  // HTTP Server
  httpServer: {

    // Is server enabled
    enabled: true,

    // TCP port
    port: 1384

  },

  // HTTPS Server
  httpsServer: {

    // Is server enabled
    enabled: true,

    // TCP port
    port: 1385,

    // Certificate configuration
    certificate: {

      // Public
      cert: configuration.applicationFolder + '/system/data/tls/public.crt',

      // Private
      key: configuration.applicationFolder + '/system/data/tls/private.key'

    }

  },

  // Web Server
  webServer: {

    // Path to "assets" folder
    assetsPath: configuration.applicationFolder + "/system/template/assets"

  },

  // MQTT client data
  mqttConnection: {

    // Hostname
    hostname: '127.0.0.1',

    // Port
    port: 1883,

    // Is authentication required?
    authRequired: true,

    // Username
    username: 'indigo',

    // Password
    password: 'rikkahikka'

  }

};

// Export configuration
module.exports = configuration;
