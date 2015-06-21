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
		updateTimeWidgetAPI();
    updateDateWidget();
    
    // Time & date widget update timers
    setInterval(updateTimeWidget, 1000);
		setInterval(updateTimeWidgetAPI, 60000);
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

/**
 * updateTimeWidgetAPI() - update weather conditions and currency rate
 * 
 */

function updateTimeWidgetAPI(weatherConditionsDOM, currencyRatesDOM) {
  
  // Default argument value
  weatherConditionsDOM = weatherConditionsDOM || "dashboard-widget-weather";
	currencyRatesDOM = currencyRatesDOM || "dashboard-widget-currate";

	// Make AJAX query
	// @FIXME Use real session, instead hard-written
	$.getJSON('/api/v1/getTimeWidgetData', { session: '16182361b7f9483b531666f5aef17939' }).fail(function () {
	
		// Error
		console.warn('API AJAX getTimeWidgetData error');
		Materialize.toast('AJAX getTimeWidgetData fail', 30000);
		
	
	}).done(function (data) {
	
		// Update Weather Conditions
		document.getElementById(weatherConditionsDOM).innerHTML = "&nbsp;" + data.weatherConditions.temperature + " &deg;C &nbsp;&bull;&nbsp; " + data.weatherConditions.humidity + " % &nbsp;&bull;&nbsp;" + data.weatherConditions.pressure + " mmHg";
		
		// Update Currency Rates
		document.getElementById(currencyRatesDOM).innerHTML = " &nbsp;USD " + data.currencyRates.usd.substring(0, data.currencyRates.usd.length - 2) + " &nbsp;&bull;&nbsp; EUR " + data.currencyRates.eur.substring(0, data.currencyRates.eur.length - 2);
		
		// Exit
		return;
		
	
	});
  
  // Exit
  return;

}