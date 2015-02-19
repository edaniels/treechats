var express = require('express');
var http = require('http');
var io = require('socket.io');
var MongoClient = require('mongodb').MongoClient;
var path = require('path');
var util = require('util');

var PORT = 8080;
var ROOT_DIR = path.resolve(__dirname , '..');
var MONGODB_URI = 'mongodb://localhost:27017/chat';

var app = express();
var httpServer = http.Server(app);
var ioServer = io(httpServer);
var db;

function getMessages(cb) {
	db.collection('messages').find({}).toArray(cb);
}

function insertMessage(messageObj, cb) {
	db.collection('messages').insert(messageObj, cb);
}

app.use('/static', express.static(ROOT_DIR + '/public'));

app.get('/v1', function(req, res){
  	res.sendFile(path.resolve(ROOT_DIR, 'html', 'index.html'));
});

app.get('/v2', function(req, res){
  	res.sendFile(path.resolve(ROOT_DIR, 'html', 'index2.html'));
});

ioServer.on('connection', function(socket) {

	socket.on('getPastMessages', function() {
		getMessages(function(err, docs) {
			socket.emit('gotPastMessages', docs);
		});
	})

	socket.on('newMessage', function(message){
		insertMessage(message, function(err, result) {
			ioServer.emit('newMessage', message);
		});
	});
});

MongoClient.connect(MONGODB_URI, function(err, newDb) {
	db = newDb;
	httpServer.listen(PORT, function(){
	  console.log(util.format('Started TreeChats server on localhost:%d', PORT));
	});
});