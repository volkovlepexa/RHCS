/*

  RHCS.System.Core.Particles.indigoError.js
  @version: 0.7.4;
  @author: Dmitriy <CatWhoCode> Nogay;

  This module exports custom system error class

*/

function IndigoError ( settings, implementationContext ) {

  settings = ( settings || {} );  
  this.message = ( settings.message || "An error occurred." );
  this.errorCode = ( settings.errorCode || "" );
  Error.captureStackTrace( this, IndigoError  );

}

require('util').inherits( IndigoError, Error );

module.exports = IndigoError;