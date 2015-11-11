/**

  RHCS Indigo - Main application

  @author: Dmitriy <CatWhoCode> Nogay;
  @version: 0.7.5 Octopus Adventure;

*/

// Initialize servers
var serverFactory = require('./system/core/factories/serverFactory.js');
var indigo = serverFactory.indigo;

// Establish MQTT connection
var mqttClient = require('./system/core/factories/mqttFactory.js');

indigo.get('/', function (req, res) {

  res.render('index', { title: 'Hey', message: 'Hello there!'});

});
