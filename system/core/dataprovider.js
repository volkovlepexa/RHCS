/**
 * DataProvider for RHCS Indigo
 * @version: 0.7.4 Laughing Bear;
 * @license: The BSD 3-Clause License
 */

/*

 [ Что это такое ? ]
 
 Данный модуль реализует возможность централизованного получения данных из
 разных источников. Каждый провайдер данных реализуется в виде отдельной 
 функции модуля. Так как мы крутые парни, мы постараемся не слоупочить с 
 синхронным выполнением, а сделаем всё как надо - через коллбэки. Каждой функции
 из данного модуля, в качестве первого аргумента, передается коллбэк.
 
 Реализованные провайдеры:
 
   1. Weather Underground (Wunderground) через JSON API
   2. Банк России (Центробанк РФ) через XML API
   
 В планах:
 
   1. Данные о пробках

 */

// Load modules
var superagent = require('superagent');
var xml2js = require('xml2js').parseString;

/**
 * cbrfParser() - Parsing Russian Federation Bank XML API
 * @param {String} Date in prepared format (dd/mm/yyyy with leading zero). Not important
 * @returns {Function} Callback with data parameters (async, yeah)
 */

module.exports.cbrfParser = function (callback, formatedDate) {
  
  // Date argument not defined
  if(typeof(formatedDate) == 'undefined') {
  
    // Preparing date in correct format (dd/mm/yyyy with leading zero)
    var date = new Date();
    formatedDate = "";

    // Appending day
    if(date.getDate() < 10) { formatedDate += "0"; }
    formatedDate += date.getDate() + "/";

    // Appending month
    if(date.getMonth() < 10) { formatedDate += "0"; }
    formatedDate += (date.getMonth() + 1) + "/";

    // Appending year
    formatedDate += date.getFullYear();
    
  }
  
  // Crete returnable object
  var functionReturnableObject = {  };
  
  // Requesting API
  superagent.get('http://www.cbr.ru/scripts/XML_daily.asp?date_req=' + formatedDate, function (err, res) {
  
    // Catch error
    if(err) {
      
      // Return error object
      functionReturnableObject.code = 500;
      functionReturnableObject.error = 'HTTP GET ERROR';
    
    }
    
    else {
      
      // API OK
      xml2js(res.text, function (err, result) {
    
        // Catch error
        if(err) {
      
          // Return error object
          functionReturnableObject.code = 500;
          functionReturnableObject.error = 'XML PARSE ERROR';
    
        }
      
        else {
        
          // Put parsed values into returnable object
          functionReturnableObject.code = 200;
          functionReturnableObject.currencyRate = {
      
            USD: result['ValCurs']['Valute'][9]['Value'][0],
            EUR: result['ValCurs']['Valute'][10]['Value'][0]
      
          };
        
        }
    
      });
      
    }
    
    // Run callback
    callback(functionReturnableObject);

  });

}

/**
 * wundergroundParser - parsing Weather Underground data
 * @param   {Function} callback Callback function
 * @param   {Object} params API parameters
 * @returns {Function} Defined callback with data parameters object
 */
module.exports.wundergroundParser = function (callback, params) {

  /*
  
    Необходимые свойства объекта params:
    
      locationCountry: 'RU'
      locationCity: 'Novosibirsk'
      apikey: 'myawesomeapikey'
  
  */
  
  // Check params
  if(
    
    typeof(params.locationCountry) === 'undefined' || 
    typeof(params.locationCity) === 'undefined' || 
    typeof(params.apikey) === 'undefined'
    
  ) {
  
    return callback({ code: 422, error: 'API PARAMETER UNDEFINED' });
    
  }
  
  // Returnable object
  var functionReturnableObject = {};
  
  // Require API
  superagent.get('https://api.wunderground.com/api/' + params.apikey + '/conditions/q/'+ params.locationCountry + '/' + params.locationCity + '.json', function (err, res) {
  
    // Catch errors
    if(err) {
    
      functionReturnableObject.code = 500;
      functionReturnableObject.error = 'HTTPS GET ERROR';
      
      return callback(functionReturnableObject);
    
    }
    
    else {
    
      // Parse JSON
      var data = JSON.parse(res.text);
  
      // Response object
      var parsedData = {

        station: data.current_observation.station_id,
        observation_timestamp: data.current_observation.observation_epoch,
        temperature: data.current_observation.temp_c,
        feel_temperature: parseInt(data.current_observation.feelslike_c),
        humidity: parseInt(data.current_observation.relative_humidity),
        pressure: (data.current_observation.pressure_mb * 0.75006375541921), // Convert mbars to mmHg
        drewpoint: data.current_observation.dewpoint_c

      };
  
      parsedData.wind = {
  
        direction: data.current_observation.wind_dir,
        speed: data.current_observation.wind_kph
  
      };
      
      functionReturnableObject.code = 200;
      functionReturnableObject.data = parsedData;
      
      return callback(functionReturnableObject);
    
    }
  
  });

}