$(function(){
	var key = /(?=.*[a-zA-Z]).{6,}/;
	var flag = true;
	$('.alert').hide();
	
	//code for creating the session
	$('#createRoom').on('click', function(){
		$('#createModal').modal('show');
		$('#createKey').hide();
		flag = true;
	});
	$('#createEmail').keypress(function(event) {
		if(event.which == 13) {
			var email = $('#createEmail').val();
			$.ajax({
				type: 'POST',
				url: 'http://' + document.domain + ':' + location.port + '/checkmail',
				data: JSON.stringify({ email : email }),
				contentType: 'application/json',
				cache: false,
				error: function(){
					console.log("URL requesting Error");
				},
				success: function(data) {
					$('#createSuggestion').html('Check your email for verification and session key');
		           	$('#div-createSuggestion').fadeTo(3000, 500).slideUp(500, function(){
			    		$('#div-createSuggestion').slideUp(500);
			    	});
					flag = false;
				}
			});
			
			$.ajax({
				type: 'POST',
				url: 'http://' + document.domain + ':' + location.port + '/identity',
				data: JSON.stringify({ email : email }),
				contentType: 'application/json',
				cache: false,
				error: function(){
					console.log("URL requesting Error");
				},
				success: function(data) {
					$('#create-form-data').attr('action', 'http://' + document.domain + ':' + location.port + '/admin')
					$('#createKey').show('slow').focus();
					flag = false;
				}
			});
		}
	});
	$('#createKey').keypress(function(event) {
		if(event.which == 13) {
			if(key.test($('#createKey').val())) {
				$.ajax({
			        url: 'http://' + document.domain + ':' + location.port + '/checkadmin',
			        type: 'POST',
			        contentType: "application/json",
			        dataType: 'json',
			        data: JSON.stringify({createEmail: $('#createEmail').val(), createKey: $('#createKey').val()}),
			        error: function(err){
			          	console.log(err);
			        },
			        success: function(data){
			           	if((data.msg == '') && (data.status == 'ok')){
			           		$('#create-form-data').submit();
			           	}
			           	else {
			           		$('#createError').html(data.msg);
			           		$('#div-createError').fadeTo(2000, 500).slideUp(500, function(){
				    			$('#div-createError').slideUp(500);
				    		});
			           	}
			        }
			    });
			}
			else {
				$('#createError').html('Key length should be greater than 6 and must contain atleast one digit');
				$('#div-createError').fadeTo(2000, 500).slideUp(500, function(){
					$('#div-createError').slideUp(500);
				});
			}
		}
	});
	$('#submit_btn_create').on('click', function(){
		if(flag) {
			var email = $('#createEmail').val();
			$.ajax({
				type: 'POST',
				url: 'http://' + document.domain + ':' + location.port + '/checkmail',
				data: JSON.stringify({ email : email }),
				contentType: 'application/json',
				cache: false,
				error: function(){
					console.log("URL requesting Error");
				},
				success: function(data) {
					$('#createSuggestion').html('Check your email for verification and session key');
		           	$('#div-createSuggestion').fadeTo(3000, 500).slideUp(500, function(){
			    		$('#div-createSuggestion').slideUp(500);
			    	});
					flag = false;
				}
			});
			
			$.ajax({
				type: 'POST',
				url: 'http://' + document.domain + ':' + location.port + '/identity',
				data: JSON.stringify({ email : email }),
				contentType: 'application/json',
				cache: false,
				error: function(){
					console.log("URL requesting Error");
				},
				success: function(data) {
					$('#create-form-data').attr('action', 'http://' + document.domain + ':' + location.port + '/admin')
					$('#createKey').show('slow').focus();
					flag = false;
				}
			});
		}
		else {
			if(key.test($('#createKey').val())) {
				$.ajax({
			        url: 'http://' + document.domain + ':' + location.port + '/checkadmin',
			        type: 'POST',
			        contentType: "application/json",
			        dataType: 'json',
			        data: JSON.stringify({createEmail: $('#createEmail').val(), createKey: $('#createKey').val()}),
			        error: function(err){
			          	console.log(err);
			        },
			        success: function(data){
			           	if((data.msg == '') && (data.status == 'ok')){
			           		$('#create-form-data').submit();
			           	}
			           	else {
			           		$('#createError').html(data.msg);
			           		$('#div-createError').fadeTo(2000, 500).slideUp(500, function(){
				    			$('#div-createError').slideUp(500);
				    		});
			           	}
			        }
			    });
			}
			else {
				$('#createError').html('Key length should be greater than 6 and must contain atleast one digit');
				$('#div-createError').fadeTo(2000, 500).slideUp(500, function(){
					$('#div-createError').slideUp(500);
				});
			}
		}
	});
			

	//code for joining the session
	$('#joinRoom').on('click', function(){
		$('#joinModal').modal('show');
	});
	$('#joinEmail').keypress(function(event) {
		if(event.which == 13) {
			$('#joinKey').focus();
		}
	});
	$('#joinKey').keypress(function(event) {
		if(event.which == 13) {
			$('#join-form-data').attr('action', 'http://' + document.domain + ':' + location.port + '/user')
			if(key.test($('#joinKey').val())) {
				$.ajax({
		          	url: 'http://' + document.domain + ':' + location.port + '/checkuser',
		          	type: 'POST',
		          	contentType: "application/json",
		          	dataType: 'json',
		          	data: JSON.stringify({joinEmail: $('#joinEmail').val(), joinKey: $('#joinKey').val()}),
		          	error: function(err){
		            	console.log(err);
		          	},
		          	success: function(data){
		            	if((data.msg == '') && (data.status == 'ok')){
		            		$('#join-form-data').submit();
		            	}
		            	else {
		            		$('#joinError').html(data.msg);
		            		$(".key").fadeTo(2000, 500).slideUp(500, function(){
			    				$(".key").slideUp(500);
			    			});
		            	}
		          	}
		        });
			}
			else {
				$('#joinError').html('Key length should be greater than 6 and must contain atleast one digit');
				$(".key").fadeTo(2000, 500).slideUp(500, function(){
					$(".key").slideUp(500);
				});
			}
		}
	});
	$('#submit_btn_join').on('click', function(){
		$('#join-form-data').attr('action', 'http://' + document.domain + ':' + location.port + '/user')
		if(key.test($('#joinKey').val())) {
			$.ajax({
		        url: 'http://' + document.domain + ':' + location.port + '/checkuser',
		        type: 'POST',
		        contentType: "application/json",
		        dataType: 'json',
		        data: JSON.stringify({joinEmail: $('#joinEmail').val(), joinKey: $('#joinKey').val()}),
		        error: function(err){
		          	console.log(err);
		        },
		        success: function(data){
		           	if((data.msg == '') && (data.status == 'ok')){
		           		$('#join-form-data').submit();
		           	}
		           	else {
		           		$('#joinError').html(data.msg);
		           		$(".key").fadeTo(2000, 500).slideUp(500, function(){
			    			$(".key").slideUp(500);
			    		});
		           	}
		        }
		    });
		}
		else {
			$('#joinError').html('Key length should be greater than 6 and must contain atleast one digit');
	  		$(".key").fadeTo(2000, 500).slideUp(500, function(){
	  			$(".key").slideUp(500);
			});
		}
	});
});