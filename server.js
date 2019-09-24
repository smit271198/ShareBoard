var express = require('express')
  , app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

var port = 80;

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
	
	console.log(data)
	
	res.sendFile(__dirname + '/adminSocket.html');
});

app.post('/checkuser', function (req, res) {
	var flag = 0;
	var msg = '';
	var status = '';
	
	for(i in data){
		if(data[i].key == req.body.joinKey) {
			if(!(data[i].admin == req.body.joinEmail)) {
				msg = '';
				status = 'ok';
				flag = 2; //flag value 2 for successfully allowing the user to join the session 
			}
			else {
				flag = 1; //flag value 1 for problem with joining with admin email which is not allowed
			}
			break;
		}
	}

	if(flag == 1) {
		msg = 'This Email is registered as Admin of '+ req.body.joinKey +' key';
	}
	else if(flag == 0){
		msg = "The "+ req.body.joinKey +" key doesn't exists";
	}
	
	res.header("Access-Control-Allow-Origin", "*");
   	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
   	res.end(JSON.stringify({status: status, msg: msg}));
});

app.post('/user', function (req, res) {
	var direct = '/index.html';
	
	for(i in data){
		if(data[i].key == req.body.joinKey) {
			if(!(data[i].admin == req.body.joinEmail)) {
				direct = '/userSocket.html';
				data[i].users.push(req.body.joinEmail);
				console.log(data);
			}
			else {
				direct = '/index.html';
			}
			break; 
		}
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