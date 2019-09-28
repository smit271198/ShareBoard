var message = $('#message');

$(document).ready(function(){
	socket = io.connect('http://127.0.0.1:80');
	socket.emit('adduser', {});
	socket.on('typing',function(data){
		message.text(data.msg);			
	});
});