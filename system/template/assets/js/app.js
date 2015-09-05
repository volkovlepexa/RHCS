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

// Sidebar menu
$(".button-collapse").sideNav();

// Update time widget
if(window.rhcs.pageMarker == 'main') {

 /**
  * updateDateWidget() - update date widget on dashboard
  * @param {String} [domElementName="dashboard-widget-date"] DOM Element ID (default: dashboard-widget-date)
  */
  
  function updateDateWidget(domElementName) {

    // Default argument value
    domElementName = domElementName || "dashboard-widget-date";

    // Getting current date
    var date = new Date();

    // Months names
    var month = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

    // Returnable string
    var parsedDate = '&nbsp;' + date.getDate() + ' ' + month[date.getMonth()] + ' ' + date.getFullYear();

    // Append new value
    document.getElementById(domElementName).innerHTML = parsedDate;

    // Exit
    return;

  }

  
  
  /**
   * updateTimeWidget() - update time widget on dashboard
   * @param {String} [domElementName="dashboard-widget-time"] DOM Element ID (default: dashboard-widget-date)
   */
  
  function updateTimeWidget(domElementName) {

    // Default argument value
    domElementName = domElementName || "dashboard-widget-time";

    // Getting date
    var date = new Date();

    // Final result value
    var parsedDate = '';

    // Each parameter (hour, min, sec) should have leading zero
    if(date.getHours() < 10) { parsedDate += '0'; }
    parsedDate += date.getHours() + ':';

    if(date.getMinutes() < 10) { parsedDate += '0'; }
    parsedDate += date.getMinutes() + ':';

    if(date.getSeconds() < 10) { parsedDate += '0'; }
    parsedDate += date.getSeconds();

    // Append new DOM value
    document.getElementById(domElementName).innerHTML = parsedDate;

    // Exit
    return;

  }

  // First run
  updateTimeWidget();
  updateDateWidget();
  
  // Set timer for do this
  setInterval(updateTimeWidget, 1000);
  setInterval(updateDateWidget, 60000);
  
  // In default mode we just show the screenshot
  document.getElementById('cameraStream').setAttribute('src', 'http://' + window.location.hostname + ':8080/?action=stream');

}