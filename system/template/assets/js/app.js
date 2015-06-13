/**
 * Indigo.Frontend.ApplicationJS - RHCS Frontend JS application
 * @author: Dmitriy <CatWhoCode> Nogay;
 * @version: 0.7.4 Laughing Bear;
 */

/* @FUTURE Refraction JS app code */

// When document loaded
$( document ).ready(function(){
  
  // Check pageMarker existing
  if(typeof(window.rhcsPageMarker) === 'undefined') {

    alert('RHCS Critical Warning: Page Marker not defined for this page');
    console.error('RHCS Critical Warning: Page Marker not defined for this page');
  
  }

  // Navigation
  if(window.rhcsPageMarker != 'auth') { $('.button-collapse').sideNav(); }
  
  // Dashboard
  if(window.rhcsPageMarker == 'dashboard') {

    // Bootstrap time & date widget update
    updateTimeWidget();
    updateDateWidget();
    
    // Time & date widget update timers
    setInterval(updateTimeWidget, 1000);
    setInterval(updateDateWidget, 60000);

  }

});

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