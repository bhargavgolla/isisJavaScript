var isisURL, username, password, header;
$(document).ready(function(){     
    $('#loginButton').click(function(e,data){
		var username = $('#username').val();
		var password = $('#password').val();
		var isisURL = $('#url').val();
		if(username.length > 0 && password.length > 0 && isisURL.length > 0){
			if(isisURL[isisURL.length - 1] !== '/'){
				isisURL = isisURL + '/';
			}
			header = "Basic " + $.base64.encode(username + ":" + password);
			$.ajax({
				url: isisURL+'restful/services/',
				accepts: "application/json",
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", header);
					$.mobile.showPageLoadingMsg(true);
				},
				complete: function() {
					$.mobile.hidePageLoadingMsg();
				},
				success: function (result) {
					console.log(result);
					console.log(result.value);
					$.mobile.changePage("#services");
					$('#servicesList').empty();
					/*for(i = 0; i < result.value.length ; i++){
						$('#servicesList').append('<li data-theme="c"><a href="#service" data-transition="slide">'+result.value[i].title+'</a></li>');
					}
					$('#servicesList').listview('refresh');*/
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
});
