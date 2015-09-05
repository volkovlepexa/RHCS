/* RHCS.Indigo - Frontend application */

// Authentication 
$('#loginForm').on('submit', function (event) {

  // Prevent default submitting
  event.preventDefault();
  
  // Get field values
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  
  // Check username
  if(typeof(username) == 'undefined' || username.length < 3 || !(/^[\w.@]+$/).test(username)) {
  
    Materialize.toast('Incorrect username', 5000);
    return false;
  
  }
  
  // Check password
  if(typeof(password) == 'undefined' || password.length < 3) {

    Materialize.toast('Incorrect password', 5000);
    return false;
  
  }
  
  // Make API request
  $.put('/api/v1/sessions/', { username: username, password: password }, function (data) {

    data = JSON.parse(data.responseText);
    
    // Error
    if(data.code != 200) { Materialize.toast(data.description, 5000); return false; }
    
    // Success (3rd parameter - expire time in seconds [31 days])
    setCookie('rhcsSession', data.session, { expires: 2678400, path: '/' });
    
    // Refresh page
    document.location.href = '/page/main';
    
    // Exit
    return;
  
  }, 'html');
  
  // Exit
  return;
  
});

$(".button-collapse").sideNav();