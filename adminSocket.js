var canvas;
var elementID;
var socket;
var startX, startY, endX, endY;
var selectedColor, strokeValue;
function setup() {
	canvas = createCanvas(1000, 500);
	canvas.parent(document.getElementById('canvas-holder'));

	socket = io.connect('http://' + document.domain + ':' + location.port);

	socket.on('connect', function(){
		socket.emit('joinAdmin', $('#key').html());
	});

	socket.on('fileDelete', function(data){
		$('#'+data.tagid).remove();
	});

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

$('#message').keyup(function(){
	socket.emit('typing', $('#message').val());
});

window.addEventListener("beforeunload", function (e) {        
    socket.emit('leaveAdmin', {}, function(data) {
        socket.disconnect();
        window.location.href = 'http://' + document.domain + ':' + location.port + '/';
    });
});

$('#leave').on('click', function(){
	socket.emit('leaveAdmin', {}, function(data){
		socket.disconnect();
        window.location.href = 'http://' + document.domain + ':' + location.port + '/';
	});
});

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

$('.progress').hide();
$('.alert').hide();
var get_url = null;
var filename = '';
var tagId = 1;
$('input[type="file"]').change(function(e){
    filename = e.target.files[0].name;
});
$('#upload').on('click', function(){
    var form_data = new FormData($('#fileForm')[0]);
    if($('#fupload')[0].files.length === 0) {
    	$('#file-error').html('No files are selected!');
    	$(".alert").fadeTo(2000, 500).slideUp(500, function(){
            $(".alert").slideUp(500);
        });
    }
    else {
    	$('.progress').show();
    	$('#fileForm')[0].reset();
    	filename = $('#key').html() + '_' + filename;
	    $.ajax({
	        type: 'POST',
	        url: 'http://' + document.domain + ':' + location.port + '/geturl',
	        data: JSON.stringify({ filename : filename }),
	        contentType: 'application/json',
	        cache: false,
		    error: function(){
	            console.log("URL requesting Error");
	            $('.progress').hide();
	            $('#file-error').html('Request Error!');
		    	$(".alert").fadeTo(2000, 500).slideUp(500, function(){
		            $(".alert").slideUp(500);
		        });
	        },
	        success: function(data) {
	            console.log('PUTURL: ' + data.PUTurl);
	            console.log('GETURL: ' + data.GETurl);
	            get_url = data.GETurl;
	            $.ajax({
	                type: 'PUT',
	                url: data.PUTurl,
	                data: form_data,
			        contentType: 'application/octet-stream',
			        cache: false,
			        processData: false,
			        error: function(){
			            console.log("File Upload Error");
			            $('.progress').hide();
			            $('#file-error').html('File Upload Error');
				    	$(".alert").fadeTo(2000, 500).slideUp(500, function(){
				            $(".alert").slideUp(500);
				        });
			        },
			        success: function(data) {
			            console.log('File Upload Successfully!');
			            $('.progress').hide();
			            var row = "<tr id=file_"+tagId+"><td>"+filename+"</td><td><a class='delete'><i class='material-icons' data-toggle='tooltip' data-placement='right' title='Delete'>delete_forever</i></a></td></tr>";
                		$('#tableBody').append(row);
                		socket.emit('fileUpload', {
                			filename: filename,
                			tagid: tagId,
                			url: get_url
                		});
                		tagId++;
			        }
			    });
		    }
		});
    }
});

$(document).on('click', 'a.delete', function(){
    var id = $(this).parent().parent().attr('id');
    socket.emit('fileDelete', { 
    	tagid: id, 
    	filename: $('#' + id + ' td:first-child').text()
    });
});