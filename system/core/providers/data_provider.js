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
var indigoError = require('../particles/indigoError.js')
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

  // Requesting API
  superagent.get('http://www.cbr.ru/scripts/XML_daily.asp?date_req=' + formatedDate, function (err, res) {

    // Catch error
    if(err) {

      // Return error object
      return callback(new IndigoError({ errorCode: 500, message: 'CBR connection error' }));

    }

    else {

      // API OK
      xml2js(res.text, function (err, result) {

        // Catch error
        if(err) {

          // Return error object
          return callback(new IndigoError({ errorCode: 500, message: 'XML parse error' }));

        }

        else {
          
          return callback( undefined, {

            code: 200,
            USD: result['ValCurs']['Valute'][9]['Value'][0],
            EUR: result['ValCurs']['Valute'][10]['Value'][0]

          });

        }

      });

    }

  });

}

/**
 * wundergroundParser - parsing Weather Underground data
 * @param   {Function} callback Callback function
 * @param   {Object} params API parameters
 * @returns {Function} Defined callback with data parameters object
 */
module.exports.wundergroundParser = function (params, callback) {

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

    return callback(new IndigoError({ errorCode: 422, message: 'Configurable parameters undefined' }));

  }

  // Require API
  superagent.get('https://api.wunderground.com/api/' + params.apikey + '/conditions/q/'+ params.locationCountry + '/' + params.locationCity + '.json', function (err, res) {

    // Catch errors
    if(err) {

      return callback(new IndigoError({ errorCode: 500, message: 'Wunderground connection error' }));

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
        pressure: Math.round(data.current_observation.pressure_mb * 0.75006375541921), // Convert mbars to mmHg
        drewpoint: data.current_observation.dewpoint_c

      };

      parsedData.wind = {

        direction: data.current_observation.wind_dir,
        speed: data.current_observation.wind_kph

      };

      parsedData.code = 200;
      
      return callback(undefined, parsedData);

    }

  });

}