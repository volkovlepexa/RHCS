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
    file: "../../data/system.db",
    
    // Configuration for LokiJS
    lokiConfiguration: {
      
      // Enable autosave
      autosave: true,
      
      // Autosave interval (in milliseconds)
      autosaveInterval: 15000
      
    }
    
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
    
  }
  
};

// Export configuration
module.exports = configuration;