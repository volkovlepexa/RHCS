/**

  Custom error class for RHCS Indigo

  @author: Dmitriy <CatWhoCode> Nogay;
  @version: 0.7.5;

*/

// Create error class
function IndigoError ( settings ) {

  // Define null settings object if it isn't defined
  settings = ( settings || {} );  
  
  // Define default variable name
  this.name = ( settings.name || "IndigoError" );
  
  // Define default message
  this.message = ( settings.message || "An error occurred." );
  
  // Define default error code
  this.errorCode = ( settings.errorCode || 400 );
  
  // Add stact trace
  Error.captureStackTrace( this, IndigoError  );

}

// Merge our custom error object with default
require('util').inherits( IndigoError, Error );

// Export
module.exports = IndigoError;