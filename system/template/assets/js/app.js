/**
 * Indigo.Frontend.ApplicationJS - RHCS Frontend JS application
 * @author: Dmitriy <CatWhoCode> Nogay;
 * @version: 0.7.4 Laughing Bear;
 */

/* @FUTURE Refraction JS app code */

// When document loaded
$( document ).ready(function(){

  $(".button-collapse").sideNav();
  
  // Check pageMarker existing
  if(typeof(window.rhcsPageMarker) == 'undefined') {

    alert("RHCS Critical Warning: Page Marker not defined for this page");
    console.error("RHCS Critical Warning: Page Marker not defined for this page");
  
  }

  // Timer for dashboard
  if(window.rhcsPageMarker == 'dashboard') {

    // Update #dashboard-widget-time every second
    setInterval(function() {
      
      // Getting date
      var date = new Date();
      
      // Final result value
      var parsedDate = "";
      
      // Each parameter (hour, min, sec) should have leading zero
      if(date.getHours() < 10) { parsedDate += "0"; }
      parsedDate += date.getHours() + ":";
      
      if(date.getMinutes() < 10) { parsedDate += "0"; }
      parsedDate += date.getMinutes() + ":";
      
      if(date.getSeconds() < 10) { parsedDate += "0"; }
      parsedDate += date.getSeconds();
      
      // Append new DOM value
      $("#dashboard-widget-time").html(parsedDate);

    }, 1000);

  }

});