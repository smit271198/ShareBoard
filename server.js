var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var port = 80;
var current_room;
server.listen(port, () => {
	console.log('Server started at '+ port +' port');
});

var data = [];

/*var AWS = require('aws-sdk');
var credentials = {
    accessKeyId: '',
    secretAccessKey : '',
    signatureVersion: 'v4'
};

AWS.config.update({credentials: credentials, region: 'us-east-1'});
var s3 = new AWS.S3();*/

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.post('/admin', function (req, res) {
	data.push(
		{
			key: req.body.createKey,
			admin: req.body.createEmail,
			users: [],
			files: []
		}
	);
	current_room = req.body.createKey;
	console.log(data)
	
	res.render(__dirname + '/adminSocket.html',{room : req.body.createKey});
});

app.post('/user', function (req, res) {
	var flag = 0;
	var direct = '/index.html';
	var msg = '';
	var solution = '';
	current_room = req.body.joinKey;
	for(i in data){
		if(data[i].key == req.body.joinKey) {
			if(!(data[i].admin == req.body.joinEmail)) {
				//direct = '/userSocket.html' + ,{room : req.body.joinKey};
				data[i].users.push(req.body.joinEmail);
				console.log(data);
				flag = 2; //flag value 2 for successfully allowing the user to join the session
				res.render(__dirname + '/userSocket.html',{room : req.body.joinKey});
				break; 
			}
			else {
				direct = '/index.html';
				flag = 1; //flag value 1 for problem with joining with admin email which is not allowed
			}
		}
	}

	if(flag == 1) {
		msg = 'This Email is registered as Admin of '+ req.body.joinKey +' key';
		solution = 'Try to join the session with other Email address';
	}
	else if(flag == 0){
		msg = "The "+ req.body.joinKey +" key doesn't exists";
		solution = 'Properly enter the key again';
	}
	
	res.sendFile(__dirname + direct);
});

/*app.post('/geturl', function (req, res) {
	console.log(req.body.filename);
  	var presignedPUTURL = s3.getSignedUrl('putObject', {
	    Bucket: 'shareboard123',
	    Key: req.body.filename,
	    Expires: 3600,
	    ContentType:'application/octet-stream'
	});
	var presignedGETURL = s3.getSignedUrl('getObject', {
	    Bucket: 'shareboard123',
	    Key: req.body.filename,
	    Expires: 3600
	});
	console.log('PUTURL : ' + presignedPUTURL);
	console.log('GETURL : ' + presignedGETURL);
	res.json({ 
		'PUTurl' : presignedPUTURL,
		'GETurl' : presignedGETURL
	});
});*/

io.sockets.on('connection', function(socket){
	console.log('New Connection ID: ' + socket.id);
	
	socket.on('adduser', function(){
		console.log('jeeeel');
		socket.room = current_room;
		console.log(socket.room);
		socket.join(current_room);		
	});
	
	socket.on('typing', function(data){
		console.log(socket.room);
		console.log(data);
		//socket.broadcast.emit('typing', {msg : data});
		io.sockets.to(socket.room).emit('typing', {msg : data});	
    	//io.to(rooms[rooms.length - 1]).emit('typing', {msg : data})
    });
	
	socket.on('drawPencil', function(data){
		socket.broadcast.emit('pencilClient', data);
	});

	socket.on('drawEraser', function(data){
		socket.broadcast.emit('eraserClient', data);
	});

	socket.on('drawRectangle', function(data){
		socket.broadcast.emit('rectangleClient', data);
	});

	socket.on('drawCir', function(data){
		socket.broadcast.emit('circleClient', data);
	});

	socket.on('clear_canvas', function(data){
		socket.broadcast.emit('clearCanvasClient', data);
	});

	socket.on('fileAdmin', function(data){
		socket.broadcast.emit('fileUser', data);
	});

});