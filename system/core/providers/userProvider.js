/**

  User subsystem provider for RHCS Indigo

  @author: Dmitriy <CatWhoCode> Nogay;
  @version: 0.7.5;

*/

var user = {
  
  // Create user
  create: function () {},  
  
  // Edit user
  edit: function () {},
  
  // Delete user
  delete: function () {},
  
  // Get user information
  information: function () {}
  
};

var session = {
  
  // Get session information
  information: function () {},
  
  // Authenticate session
  authenticate: function () {},
  
  // Deauthenticate session
  deauthenticate: function () {}
  
}

/**
 * User.Create - Create user
 * @param   {String}   username Username (example: fwoods)
 * @param   {String}   password Password (example: woods11071984)
 * @param   {String}   email    Email (example: frank.woods@cia.gov)
 * @param   {String}   name     Full name (example: Frank Woods)
 * @param   {String}   birthday Birthday date (example: 11.07.1984)
 * @param   {Function} callback Callback
 * @returns {Fucntion} Callback
 */
user.create = function (username, password, email, name, birthday, callback) {
  
  return callback();
  
}

/* Exporting functions */
module.exports.user = user;
module.exports.session = session;