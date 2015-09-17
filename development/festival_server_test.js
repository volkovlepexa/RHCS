// Load modules
var feedparser = require('feedparser');
var request = require('request');
var net = require('net');
var client = new net.Socket();

client.connect(1314, '127.0.0.1', function() {

  client.write('(SayText "Сейчас я зачитаю последние новости")');
  
  // Load feed
  var req = request('https://news.yandex.ru/index.rss');
  var feed = feedparser = new feedparser();

  req.on('error', function (error) {

    console.warn("RSS Download " + error);

  });

  req.on('response', function (res) {

    var stream = this;

    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

    stream.pipe(feedparser);

  });

  feedparser.on('error', function(error) {

    console.warn('Feedparser' + error);

  });

  feedparser.on('readable', function() {

    // This is where the action is!
    var stream = this, meta = this.meta, item;

    while (item = stream.read()) {

      client.write('(SayText "' + item.title + '")');

    }

  });
  
});