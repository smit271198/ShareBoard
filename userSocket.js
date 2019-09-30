var canvas;
var isEraser;
var socket;

function setup() {
	canvas = createCanvas(1000, 500);
	canvas.parent(document.getElementById('canvas-holder'));
	isEraser = false;

	socket = io.connect('http://' + document.domain + ':' + location.port);
	
	socket.on('connect', function(){
		socket.emit('joinUser', $('#key').html());
	});

	socket.on('typing',function(data){
		$('#message').html(data);			
	});

	socket.on('pencilClient', function(data){
		stroke(data.color);
		strokeWeight(data.stroke);
		line(data.x, data.y, data.px, data.py);
	});
	
	socket.on('eraserClient', function(data){
		stroke('white');
		strokeWeight(data.stroke);
		line(data.x, data.y, data.px, data.py);
	});
	
	socket.on('rectangleClient', function(data){
		stroke(data.color);
		strokeWeight(data.stroke);
		rect(data.x, data.y, data.w, data.h);
	});

	socket.on('circleClient', function(data){
		stroke(data.color);
		strokeWeight(data.stroke);
		ellipse(data.x, data.y, data.w, data.h);
	});

	socket.on('clearCanvasClient', function(data){
		canvas = createCanvas(1000, 500);
		canvas.parent('canvas-holder');
	});

	socket.on('fileUpload', function(data){
		var row = "<tr id=file_"+data.tagid+"><td>"+data.filename+"</td><td><a href="+data.url+" target='_blank' data-toggle='tooltip' data-placement='right' title='Download'><i class='material-icons'>cloud_download</i></a></td></tr>";
        $('#tableBody').append(row);
	});

	socket.on('fileDelete', function(data){
		$('#'+data.tagid).remove();
	});

	socket.on('forceExit', function(data){
		socket.emit('leaveUser', { email: $('#userEmail').html(), flag: data.flag}, function(data){
			socket.disconnect();
	        window.location.href = 'http://' + document.domain + ':' + location.port + '/';
		});
	});
}

function downloadCanvas(link, filename) {
	link.href = document.getElementById('defaultCanvas0').toDataURL();
	link.download = filename;
}

window.addEventListener("beforeunload", function (e) {        
    socket.emit('leaveUser', { email: $('#userEmail').html(), flag: 0}, function(data) {
        socket.disconnect();
        window.location.href = 'http://' + document.domain + ':' + location.port + '/';
    });
});

$('#leave').on('click', function(){
	socket.emit('leaveUser', { email: $('#userEmail').html(), flag: 0}, function(data){
		socket.disconnect();
        window.location.href = 'http://' + document.domain + ':' + location.port + '/';
	});
});

document.getElementById('download').addEventListener('click', function() {
	downloadCanvas(this, 'masterpiece.png');
}, false);