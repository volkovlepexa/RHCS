/*

  Это очень-очень простой парсер новостей, написанный в спешке на Робофинисте.
  @catwhocode // 20 Sep 2015

*/

// Load modules
var feedparser = require('feedparser');
var request = require('request');
var net = require('net');
var client = new net.Socket();
var log = require('mag')('FestivalNewsreader')

// Connecting to Festival TCP Server
client.connect(1314, '127.0.0.1', function() {

  // Say introducing
  client.write('(SayText "Сейчас я зачитаю последние новости")');
  
  // Load feed
  var req = request('https://news.yandex.ru/index.rss');
  var feed = feedparser = new feedparser();

  // If feed loading had an error
  req.on('error', function (error) { log.error("RSS Download " + error); });

  // Received payload from pipe
  req.on('response', function (res) {

    var stream = this;

    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

    stream.pipe(feedparser);

  });

  // Feedparser error catcher
  feedparser.on('error', function(err) {

    // Throw error
    throw err;

  });

  // Received at least one completed news
  feedparser.on('readable', function() {

    // Prepopulate variables
    var stream = this, meta = this.meta, item;

    // Read single news payload from RSS Feed
    while (item = stream.read()) {

      // Send to Festival server
      client.write('(SayText "' + item.title + '")');
      
      // Drop news title in stdout
      log.error(item.title);

    }

  });
  
});

// Catch TCP client error
client.on('error', function (err) {

  // Drop error into console
  log.error('TCP client error: ' + err.message);
  
  // Exit
  return;

});