var canvas;
var isEraser;
var socket;

function setup() {
	canvas = createCanvas(1000, 500);
	canvas.parent(document.getElementById('canvas-holder'));
	isEraser = false;

	socket = io.connect('http://'+document.domain);
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
}

function downloadCanvas(link, filename) {
	link.href = document.getElementById('defaultCanvas0').toDataURL();
	link.download = filename;
}

document.getElementById('download').addEventListener('click', function() {
	downloadCanvas(this, 'masterpiece.png');
}, false);