var express = require('express')
  , app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");
var ejs = require('ejs');
var AWS = require('aws-sdk');
var randomstring = require("randomstring");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

var port = 80;

server.listen(port, () => {
	console.log('Server started at '+ port +' port');
});

var data = [];
var Verifiedemail = [];
var valid_keys = [];

var credentials = {
    accessKeyId: '',
    secretAccessKey : '',
    signatureVersion: 'v4'
};

AWS.config.update({credentials: credentials, region: 'us-east-1'});
var s3 = new AWS.S3();
var ses = new AWS.SES();

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

//check if mail is verified or not
app.post('/checkmail', function (req, res) {
	var email = req.body.email;
	var msg = 'Your Email is already verified so check your email for session key';
	var flag = false;
	
	ses.listVerifiedEmailAddresses(function(err, data) {
		Verifiedemail = data.VerifiedEmailAddresses;
		if(err) {
			console.log(err);
		} 
		else {
		} 
		
		if(Verifiedemail.includes(email)){
		}
		else{
			var params = {
				EmailAddress:email
			};    
			ses.verifyEmailAddress(params, function(err, data) {
				if(err){
					console.log(err);
				}
				else{
					flag = true;
				} 
			});
		}
	});

	if(flag){
		msg = 'Your Email is not verified so first verify it and then you will get the email for session key';
	}
	
	res.header("Access-Control-Allow-Origin", "*");
   	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
   	res.end(JSON.stringify({msg: msg}));
});

//sendkey through email
app.post('/identity', function (req, res) {
	var email = req.body.email;
	
	var msg = 'mail has been sent to you';
	var key = randomstring.generate(6);
	var params = {
		Identities: [ /* required */
			email,
		]
	}; 
	ses.getIdentityVerificationAttributes(params, function(err, data) {
		if(err){
			console.log(err);
		} 
		else{
		}
	});
	
	ses.waitFor('identityExists', params, function(err, data) {
		if (err) console.log(err, err.stack); 
		else{
			ses.listVerifiedEmailAddresses(function(err, data) {
				Verifiedemail = data.VerifiedEmailAddresses;
				if(err) {
					console.log(err);
				} 
				else {
				} 
		
				if(Verifiedemail.includes(email)) {
					//var ses_mail = "From: 'Shareboard' <" + email + ">\n";
					var ses_mail = "From: 'Shareboard' <sharedboard@outlook.com>\n";
					ses_mail = ses_mail + "To: " + email + "\n";
					ses_mail = ses_mail + "Subject: Shareboard Class Key\n";
					ses_mail = ses_mail + "MIME-Version: 1.0\n";
					ses_mail = ses_mail + "Content-Type: multipart/mixed; boundary=\"NextPart\"\n\n";
					ses_mail = ses_mail + "--NextPart\n";
					ses_mail = ses_mail + "Content-Type: text/html; charset=us-ascii\n\n";
					ses_mail = ses_mail + "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'><center><h1>ShareBoard</h1></center><br><center><h2><small class='text-muted'>Your Session Key</small></h2></center><br><center><h3>"+key+"</h3></center>";
					ses_mail = ses_mail + "--NextPart--";
				
					var params = {
						RawMessage: { Data: new Buffer.from(ses_mail) },
						Destinations: [ email ],
						//Source: "'Shareboard' <" + email + ">'"
						Source: "sharedboard@outlook.com"
					};
					ses.sendRawEmail(params, function(err, data) {
						if(err) {
							console.log(err);
						} 
						else {
							valid_keys.push({
								key : key,
								email : email
							});
						}
					});
				}
			});
		}
	});
	
	res.header("Access-Control-Allow-Origin", "*");
   	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
   	res.end(JSON.stringify({msg: msg}));
});

app.post('/checkadmin', function (req, res) {
	var msg = "";
	var status = '';
	var index = valid_keys.map(function(e){ return e.key; }).indexOf(req.body.createKey);
	if(index == -1){
		msg = "The "+ req.body.createKey +" key doesn't exists";
	}
	else{
		if(valid_keys[index].email != req.body.createEmail){
			msg = "The "+ req.body.createKey +" key doesn't match with your email address";
		}
		else{
			status = 'ok';
		}
	}
	
	res.header("Access-Control-Allow-Origin", "*");
   	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
   	res.end(JSON.stringify({status: status, msg: msg}));
});

app.post('/admin', function (req, res) {
	var direct = '';
	var index = valid_keys.map(function(e){ return e.key; }).indexOf(req.body.createKey);
	if(index == -1){
		direct= '/index.html';
	}
	else{
		if(valid_keys[index].email != req.body.createEmail){
			direct= '/index.html';
		}
		else{
			valid_keys.splice(valid_keys.map(function(e){ return e.key; }).indexOf(req.body.createKey), 1);
			direct= '/adminSocket.html';
			data.push(
				{
					key: req.body.createKey,
					admin: req.body.createEmail,
					users: [],
					files: []
				}
			);
		}
	}
	
	res.render(__dirname + direct, {key: req.body.createKey, email: req.body.createEmail});
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
			}
			else {
				direct = '/index.html';
			}
			break; 
		}
	}

	res.render(__dirname + direct, {key: req.body.joinKey, email: req.body.joinEmail});
});

app.post('/geturl', function (req, res) {
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
	res.json({ 
		'PUTurl' : presignedPUTURL,
		'GETurl' : presignedGETURL
	});
});

io.sockets.on('connection', function(socket){
	
	socket.on('joinAdmin', function(value){
		socket.room = value;
		socket.join(value);
	});

	socket.on('joinUser', function(value){
		socket.room = value;
		socket.join(value);
	});

	socket.on('typing', function(value){
		socket.broadcast.to(socket.room).emit('typing', value);	
    });

    socket.on('fileUpload', function(value){
    	data[data.map(function(e){ return e.key; }).indexOf(socket.room)].files.push(value.filename);
		socket.broadcast.to(socket.room).emit('fileUpload', value);	
    });

    socket.on('fileDelete', function(value){
    	s3.deleteObjects({
    		Bucket: 'shareboard123',
			Delete: { 
			    Objects: [ 
			      	{
			        	Key: value.filename
			      	}
			    ],
			},
    	}, function(err, data){
    		if(err)
    			console.log(err, err.stack);
    		else{

    		}
    	});
    	data[data.map(function(e){ return e.key; }).indexOf(socket.room)].files.splice(data[data.map(function(e){ return e.key; }).indexOf(socket.room)].files.indexOf(value.filename), 1);
		io.sockets.in(socket.room).emit('fileDelete', value);
    });

	socket.on('drawPencil', function(value){
		socket.broadcast.to(socket.room).emit('pencilClient', value);
	});

	socket.on('drawEraser', function(value){
		socket.broadcast.to(socket.room).emit('eraserClient', value);
	});

	socket.on('drawRectangle', function(value){
		socket.broadcast.to(socket.room).emit('rectangleClient', value);
	});

	socket.on('drawCir', function(value){
		socket.broadcast.to(socket.room).emit('circleClient', value);
	});

	socket.on('clear_canvas', function(value){
		socket.broadcast.to(socket.room).emit('clearCanvasClient', value);
	});

	socket.on('leaveAdmin', function(value, fn){
		var file = data[data.map(function(e){ return e.key; }).indexOf(socket.room)].files
		var fileData = [];
		for(var i in file){
			fileData.push( { Key: file[i] } );
		}
		s3.deleteObjects({
    		Bucket: 'shareboard123',
			Delete: { 
			    Objects: fileData,
			},
    	}, function(err, data){
    		if(err)
    			console.log(err, err.stack);
    		else{

    		}
    	});
		socket.broadcast.to(socket.room).emit('forceExit', { flag: 1 });
		//here flag=1 suggest that it's main object will be deleted by admin so need to delete it's userEmail personally from the list
		socket.leave(socket.room);
		data.splice(data.map(function(e){ return e.key; }).indexOf(socket.room), 1);
		fn('leaveAdmin with key');
	});

	socket.on('leaveUser', function(value, fn){
		if(value.flag == 0) {
			//here flag=0 suggest that request coming from the client is to leave the particular user from the key
			data[data.map(function(e){ return e.key; }).indexOf(socket.room)].users.splice(data[data.map(function(e){ return e.key; }).indexOf(socket.room)].users.indexOf(value.email), 1);
		}
		socket.leave(socket.room);
		fn('leaveUser with key');
	});

});