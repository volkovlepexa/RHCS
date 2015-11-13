/**

  RHCS Frontend App - Frontend for RHCS Indio

  @author: Dmitriy <CatWhoCode> Nogay;
  @version: 0.7.5 Octopus Adventure;

*/

// Helpfull snippets
var s = {

  // Regular expressions
  regexpr: {

    numLetters: (/^[\w]+$/),
    username: (/^[\w.@]+$/),
    latinCyrillic: (/^[\wа-яА-Я ]+$/),
    hex: (/^[0-9A-Fa-f]+$/)

  },

  // getElementById
  gebid: function (id) { return document.getElementById(id); }

};

if(window.rhcs.pageMarker === "auth") {

  // Set callback onClick event for "login" button
  s.gebid('authSubmit').onclick = function (event) {

    // Get username & password
    var username = s.gebid('usernameField').value;
    var password = s.gebid('passwordField').value;

    // Check length
    if(username.length < 3 || password.length < 3) {

      // Show error
      humane.log('Username or password too short');

      // Exit
      return false;

    }

    // Check threw regular expressions
    if(!(s.regexpr.username).test(username)) {

      // Show error
      humane.log('Username was incorrect');

      // Exit
      return false;

    }

    // Prevent default scenario (send GET /#)
    event.preventDefault();

  };

}
