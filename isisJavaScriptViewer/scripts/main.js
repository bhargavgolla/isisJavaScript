var isisURL, username, password, header;
$(document).ready(function(){
    $('#loginButton').click(function(e,data){
		username = $('#username').val();
		password = $('#password').val();
		isisURL = $('#url').val();
		if(username.length > 0 && password.length > 0 && isisURL.length > 0){
			if(isisURL[isisURL.length - 1] !== '/'){
				isisURL = isisURL + '/';
			}
			header = "Basic " + $.base64.encode(username + ":" + password);
			$.ajax({
				url: isisURL+'restful/services/',
				beforeSend: function(xhr) {
					//xhr.setRequestHeader("Authorization", header);
					xhr.setRequestHeader("Accept", "application/json");
					$.mobile.showPageLoadingMsg(true);
				},
				complete: function() {
					$.mobile.hidePageLoadingMsg();
				},
				success: function (result) {
					console.log(result.value);
					$.mobile.changePage("#services");
					$('#servicesList').empty();
					for(i = 0; i < result.value.length ; i++){
						$('#servicesList').append('<li data-theme="c"><a class="service" data-href="'+result.value[i].href+'" data-transition="slide">'+result.value[i].title+'</a></li>');
					}
					$('#servicesList').listview('refresh');
				},
				error: function (request,error) {
					console.log(error);
					alert('Username and Password donot match!');
				}
			});
		} else {
			alert('All fields are required.');
		}
    });
	$('.service').livequery("click",function(){
		$.ajax({
			url: $(this).attr('data-href'),
			beforeSend: function(xhr) {
				//xhr.setRequestHeader("Authorization", header);
				xhr.setRequestHeader("Accept", "application/json");
				$.mobile.showPageLoadingMsg(true);
			},
			complete: function() {
				$.mobile.hidePageLoadingMsg();
			},
			success: function (result) {
				var collections = result.members;
				console.log(collections);
				$.mobile.changePage("#service");
				$('#collectionsList').empty();
				for(var collection in collections){
					$('#collectionsList').append('<li data-theme="c"><a class="collection" data-href="'+collections[collection].links[0].href+'" data-transition="slide">'+collection+'</a></li>');
				}
				$('#collectionsList').listview('refresh');
			},
			error: function (request,error) {
				console.log(error);
				alert('Username and Password donot match!');
			}
		});
    });
	
	$('.collection').livequery("click",function(){
		$.ajax({
			url: $(this).attr('data-href')+"/invoke",
			beforeSend: function(xhr) {
				//xhr.setRequestHeader("Authorization", header);
				xhr.setRequestHeader("Accept", "application/json");
				$.mobile.showPageLoadingMsg(true);
			},
			complete: function() {
				$.mobile.hidePageLoadingMsg();
			},
			success: function (data) {
				var objects = data.result.value;
				console.log(objects);
				$.mobile.changePage("#objects");
				$('#objectsList').empty();
				for(i = 0; i < objects.length; i++){
					$('#objectsList').append('<li data-theme="c"><a class="object" data-href="'+objects[i].href+'" data-transition="slide">'+objects[i].title+'</a></li>');
				}
				$('#objectsList').listview('refresh');
			},
			error: function (request,error) {
				console.log(error);
				alert('Username and Password donot match!');
			}
		});
    });
});
