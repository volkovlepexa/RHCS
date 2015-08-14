var userProvider = require('../system/core/user_provider.js');

function myLovelyDebugger(err, data) {

  if(err) {

    // If we had strange error type (not our custom AuthenticationError)
    if(typeof(err.name) == 'undefined' || err.name != "AuthenticationError") { console.trace("Invalid error type");  return; }

    // If we have correct error
    console.log("Error " + err.errorCode + ": " + err.message);
    return;

  }

  console.log("Success!");
  console.log(data);

}

/*

// User.getUserInformation - get information about user
userProvider.getUserInformation('demousr', function (err, data) { myLovelyDebugger(err, data); });

*/


/*

// User.authenticateUsername - authenticating user via username + password
userProvider.authenticateUsername('demousr', 'demopassword', function (err, data) { myLovelyDebugger(err, data); });

*/


/*

// User.deauthenticateSession - deauthenticate session
userProvider.deauthenticateSession('8245d1c45892bf06ea93df53c48a6549', function (err, data) { myLovelyDebugger(err, data); });

*/

/*

// User.getSessionInformation - get information about session
userProvider.getSessionInformation('8245d1c45892bf06ea93df53c48a6549', function (err, data) { myLovelyDebugger(err, data); });

*/

/*

// User.createUser - create user
userProvider.createUser('demousr', 'demopassword', 'Peter', 'peter@example.com', '03.02.1970', function (err, data) { myLovelyDebugger(err,data); });

*/

/*

// User.deleteUser - delete user
userProvider.deleteUser('demousr', function (err, data) { myLovelyDebugger(err, data); });

*/

