/**
 * User subsystem for RHCS Indigo
 * @version: 0.7.4 Laughing Bear;
 * @license: The BSD 3-Clause License
 */

/**
 * validateSessionAction - Check API Session and run callback with data
 * @param   {String} session API session string
 * @param   {Function} callback Callback with data
 * @returns {Function} Callback
 */
module.exports.validateSessionAction = function(session, callback) {

  // Check data existing
  if(typeof(session) === 'undefined') {
  
    // Return with error code
    return callback({ code: 422, error: 'Session not defined' });
  
  }
  
  // Check session length
  if(session.length !== 32 || !session.match(/^[0-9A-Fa-f]+$/) ) {
  
    return callback({ code: 422, error: 'Session incorrect' });
  
  }
  
  // Get session data
  global['indigoRedis'].get('rhcs:sessions:' + session, function (err, data) {
  
    // Throw error
    if(err) {
      
      // Exit
      return callback({ code: 500, error: err });
    
    }
    
    // Check data
    if(data) { return callback({ code: 200, data: data }); }
    else { return callback({ code: 401, error: "Session not exist" }); }
  
  });

}