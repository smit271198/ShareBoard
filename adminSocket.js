var canvas;
var elementID;
var socket;
var startX, startY, endX, endY;
var selectedColor, strokeValue;
function setup() {
	canvas = createCanvas(1000, 500);
	canvas.parent(document.getElementById('canvas-holder'));

	socket = io.connect('http://127.0.0.1:80');

	selectedColor = document.getElementById('colorpicker').value;
	strokeValue = document.getElementById('strokeValue').value;
}

function downloadCanvas(link, filename) {
	link.href = document.getElementById('defaultCanvas0').toDataURL();
	link.download = filename;
}

document.getElementById('pencil').addEventListener('click', function() {
	elementID = 0;
});

document.getElementById('eraser').addEventListener('click', function() {
	elementID = 1;
});

document.getElementById('rectangle').addEventListener('click', function() {
	elementID = 2;
});

document.getElementById('cir').addEventListener('click', function() {
	elementID = 3;
});

document.getElementById('clearCanvas').addEventListener('click', function() {
	canvas = createCanvas(1000, 500);
	canvas.parent('canvas-holder');
	socket.emit('clear_canvas', {});
});

document.getElementById('colorpicker').addEventListener('change', function() {
	selectedColor = this.value;
});

document.getElementById('strokeValue').addEventListener('change', function() {
	strokeValue = this.value;
});

document.getElementById('download').addEventListener('click', function() {
	downloadCanvas(this, 'masterpiece.png');
}, false);

function mouseDragged() {
	if (elementID == 1) {
		stroke('white');
		strokeWeight(strokeValue);
		line(mouseX, mouseY, pmouseX, pmouseY);
		socket.emit('drawEraser', {
			x: mouseX,
			y: mouseY,
			px: pmouseX,
			py: pmouseY,
			stroke: strokeValue
		});
	}
	else if(elementID == 0){
		stroke(selectedColor);
		strokeWeight(strokeValue);
		line(mouseX, mouseY, pmouseX, pmouseY);
		socket.emit('drawPencil', {
			x: mouseX,
			y: mouseY,
			px: pmouseX,
			py: pmouseY,
			color: selectedColor,
			stroke: strokeValue
		});
	}
}

function mousePressed(){
	if(elementID == 2){
		stroke(selectedColor);
		strokeWeight(strokeValue);
		startX = mouseX;
		startY = mouseY;
	}
	else if(elementID == 3){
		stroke(selectedColor);
		strokeWeight(strokeValue);
		startX = mouseX;
		startY = mouseY;
	}
}

function mouseReleased(){
	if(elementID == 2){
		endX = mouseX;
		endY = mouseY;
		rect(startX, startY, endX - startX, endY - startY);
		socket.emit('drawRectangle', {
			x: startX,
			y: startY,
			w: endX - startX,
			h: endY - startY,
			color: selectedColor,
			stroke: strokeValue
		});
	}
	else if(elementID == 3){
		endX = mouseX;
		endY = mouseY;
		ellipse((startX + endX)/2, (startY + endY)/2, endX - startX, endX - startX);
		socket.emit('drawCir', {
			x: (startX + endX)/2,
			y: (startY + endY)/2,
			w: endX - startX,
			h: endX - startX,
			color: selectedColor,
			stroke: strokeValue
		});
	}
}