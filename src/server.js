var express = require('express');
var http = require('http');
var io = require('socket.io');
var MongoClient = require('mongodb').MongoClient;
var path = require('path');
var util = require('util');

var PORT = 8080;
var ROOT_DIR = path.resolve(__dirname , '..');
var HTML_DIR = path.resolve(ROOT_DIR, 'html');
var MONGODB_URI = 'mongodb://localhost:27017/chat';

// Logging constants. nothing special.
var DEBUG = 'DEBUG';
var ERROR = 'ERROR';
var DEFAULT_LOG_LEVEL = DEBUG;

var app = express();
var httpServer = http.Server(app);
var ioServer = io(httpServer);
var db;

// All log attempts are processed
function log(msg, level) {
	level = level || DEFAULT_LOG_LEVEL;
	console.log(util.format('%s: %s', level, msg));
}

app.use('/static', express.static(ROOT_DIR + '/public'));

app.get('/', function(req, res) {
	res.send('<a href="/v1">Version 1</a> <br/><br/> <a href="/v2">Version 2</a>');
});

app.get('/v1', function(req, res){
  	res.sendFile(path.resolve(HTML_DIR, 'index.html'));
});

app.get('/v2', function(req, res){
  	res.sendFile(path.resolve(HTML_DIR, 'index2.html'));
});

ioServer.on('connection', function(socket) {

	socket.on('getPastMessages', function() {
		db.collection('messages').find({}).toArray(function(err, docs) {
			if (err) {
				log(err, ERROR);
			} else {
				log('Sending past messages: ');
				for (var i = 0; i < docs.length; i++) {
					log(JSON.stringify(docs[i]));
				}
				socket.emit('gotPastMessages', docs);
			}
		});
	})

	socket.on('newMessage', function(message){
		log(DEBUG, 'Inserting: ' + JSON.stringify(message));
		db.collection('messages').insert(message, function(err, result) {
			if (err) {
				log(err, ERROR);
			} else {
				ioServer.emit('newMessage', message);
			}
		});
	});
});

MongoClient.connect(MONGODB_URI, function(err, newDb) {

	if (err) {
		throw err;
	}

	db = newDb;
	httpServer.listen(PORT, function(){
	  log(util.format('Started TreeChats server on localhost:%d', PORT));
	});
});