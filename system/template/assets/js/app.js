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
  
  // All the things
  window.rhcs.thingsList = [];
  
  // In default mode we just show the screenshot
  document.getElementById('cameraStream').setAttribute('src', 'http://' + window.location.hostname + ':8085/?action=stream');
  
  // Connect to socket server
  var socket = io.connect('https://' + window.location.hostname + ':1385');
  
  // Callback
  socket.on('mosi', function (data) {
    
    if(data.payloadType == 'thingState') {
    
      // Log
      console.log('thingUpdate: ' + data.thingID + ':' + data.value);
      
      // Checkbox
      if(window.rhcs.thingsList[data.thingID].getAttribute('type') == 'checkbox') { window.rhcs.thingsList[data.thingID].checked = data.value; }
      
      // Range
      else { window.rhcs.thingsList[data.thingID].value = data.value; }
    
    }
    
  });
  
  // Notifications
  socket.on('notification', function (data) {
  
    // Check data
    if(typeof(data.message) == 'undefined') { console.error('Incorrect notification received'); return; }
    
    // Simple notification
    else if(typeof(data.title) == 'undefined') { swal(data.message); return; }
    
    // Information notification
    else if(typeof(data.type) == 'undefined') { swal(data.title, data.message, 'info'); }
    
    // Another notification type
    else {
    
      
      // Incorrect notification type
      if(data.type !== 'warning' && data.type !== 'error' && data.type !== 'success' && data.type !== 'info') {

        // Log error
        console.error('Incorrect notification type received');
        
        // Show as <Information> notification
        swal(data.title, data.message, 'info');
        
        // Exit
        return;
      
      }
      
      // Show notification
      swal(data.title, data.message, data.type);
      
      // Exit
      return;
    
    }
  
  });
  
  // Push new value throw socket.io
  function pushNewValue(element) {

    var thingID = element.dataset.thingid;

    // For checkbox
    if(element.getAttribute('type') == 'checkbox') { socket.emit('miso', { taskName: 'PTV', session: getCookie('rhcsSession'), thingID: thingID, value: element.checked + 0 }); }

    // For range
    else if(element.getAttribute('type') == 'range') { socket.emit('miso', { taskName: 'PTV', session: getCookie('rhcsSession'), thingID: thingID, value: element.value }); }
    
    console.log('thingPush: ' + element.checked + ' | ' + element.value);

  }


  // Enumerate things
  $('input[type=checkbox],input[type=range]').each(function (num, element) {

    // Get element id
    var elementThingID = element.dataset.thingid;

    // Save to pointer list
    window.rhcs.thingsList[elementThingID] = element;

  });
  
  // Request values
  function refreshValues() {
    
    window.rhcs.thingsList.forEach(function (item, i) {

    socket.emit('miso', { taskName: 'GTV', session: getCookie('rhcsSession'), thingID: i });

  });
    
  }
  refreshValues();
  
  // Change group state
  function switchGroupState(element, value) {

    // Scan all things on page
    window.rhcs.thingsList.forEach(function (item, num) {

      // Select group
      if(item.dataset.thinggroup == element.dataset.thinggroup) {

        // Checkbox
        if(item.getAttribute('type') == 'checkbox') {
          
          socket.emit('miso', { taskName: 'PTV', session: getCookie('rhcsSession'), thingID: num, value: value });
          item.checked = value;
        
        }

        // Range
        else if(item.getAttribute('type') == 'range') {
          
          // Universal solution in each situation
          if(value === 1) { value = 255; }
          socket.emit('miso', { taskName: 'PTV', session: getCookie('rhcsSession'), thingID: num, value: value });
          item.value = value;
        
        }

      }

    });

  }

}