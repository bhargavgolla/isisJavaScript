var isisURL, username, password, header;

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
			v = {"value":this.value};
            o[this.name].push(v);
        } else {
			v = {"value":this.value};
            o[this.name] = v;
        }
    });
    return o;
}

var populatePostData = function(){
	var data = {};
	$('.newObjectDetails div input').each(function(){
		propId =  $(this).attr('id');
		propVal = $(this).val();
		$.extend(data , {propId : propVal});
	});
	data = JSON.stringify(data);
	console.log(data);
	return data;
}

var initializeInputs = function(){
	$('.objectDetails input,.objectDetails select,.objectDetails textarea').change(function() {
		$(this).attr('data-changed',"1");
	});
}

var updateProperty = function(selector){
	var propertyValue = $(selector).val();
	if(propertyValue == "on"){
		propertyValue = true;
	} else if(propertyValue == "off"){
		propertyValue = false;
	}
	var propertyData = {
		"value":propertyValue
	};
	var version = parseInt($('#versionSequence').val()) + 1;
	propertyData = JSON.stringify(propertyData);
	$.ajax({
		type: "PUT",
		url: $(selector).attr('data-href'),
		dataType: 'json',
		data: propertyData,
		beforeSend: function(xhr) {
			//xhr.setRequestHeader("Authorization", header);
			xhr.setRequestHeader("Accept", "application/json");
			$.mobile.showPageLoadingMsg(true);
		},
		complete: function() {
			$.mobile.hidePageLoadingMsg();
		},
		success: function (data) {
			alert('Object updated successfully');
			$(selector).attr('data-changed',"0");
			$('#versionSequence').val(version);
		},
		error: function (request,error) {
			console.log(error);
			alert("Object couldn't be updated!");
		}
	});
}

$(document).ready(function(){
	initializeInputs();
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
				url: isisURL+'restful/services/', //Localbox
				//url: isisURL+'services/', //.NET
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
					$('#collectionsList').append('<li data-theme="c"><a class="collection" data-id="'+collections[collection].id+'" data-href="'+collections[collection].links[0].href+'" data-transition="slide">'+collection+'</a></li>');
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
		var collection_id = $(this).attr('data-id');
		if(collection_id.indexOf("new") != -1){
			$.mobile.changePage("#newObject");
			$("#createObject").attr('data-href',$(this).attr('data-href')+"/invoke");
		} else if(collection_id.indexOf("similarTo") != -1){
		
		} else{
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
		}
    });
	
	$('.object').livequery("click",function(){
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
			success: function (data) {
				var objectDetails = data.members;
				var put_url = data.links[2].href;
				console.log(objectDetails);
				$.mobile.changePage("#object");
				for(var detail in objectDetails){
					if(objectDetails[detail].memberType == "property"){
						if($("#"+detail).length > 0){
							if(typeof objectDetails[detail].value == 'boolean'){
								if(objectDetails[detail].value){
									$("#"+detail).val('on');
								}
							} else {
								$("#"+detail).val(objectDetails[detail].value);
							}
							$("#"+detail).attr('data-href',objectDetails[detail].links[0].href);
						}
					}
				}
				$('#editObject').attr('data-href',put_url);
			},
			error: function (request,error) {
				console.log(error);
				alert('Username and Password donot match!');
			}
		});
    });
	
	$('#editObject').click(function(){
		/*var newDetails = populatePutString();
		$.ajax({
			type: "PUT",
			url: $(this).attr('data-href'),
			data: newDetails,
			beforeSend: function(xhr) {
				//xhr.setRequestHeader("Authorization", header);
				xhr.setRequestHeader("Accept", "application/json");
				$.mobile.showPageLoadingMsg(true);
			},
			complete: function() {
				$.mobile.hidePageLoadingMsg();
			},
			success: function (data) {
				$('#versionSequence').val($('#versionSequence').val()++);
				alert('Object updated successfully');
			},
			error: function (request,error) {
				console.log(error);
				alert('Username and Password donot match!');
			}
		});*/
		$('.objectDetails input,.objectDetails select,.objectDetails textarea').each(function(){
			if($(this).attr('data-changed') != "0"){
				updateProperty(this);
			}
		});
	});
	
	$('#createObject').click(function(){
		var newDetails = JSON.stringify($('.newObjectDetails form').serializeObject());
		console.log(newDetails);
		$.ajax({
			type: "POST",
			url: $(this).attr('data-href'),
			data: newDetails,
			beforeSend: function(xhr) {
				//xhr.setRequestHeader("Authorization", header);
				xhr.setRequestHeader("Accept", "application/json");
				$.mobile.showPageLoadingMsg(true);
			},
			complete: function() {
				$.mobile.hidePageLoadingMsg();
			},
			success: function (data) {
				alert('Object created successfully');
				$.mobile.changePage("#service");
			},
			error: function (request,error) {
				console.log(error);
				alert('Username and Password donot match!');
			}
		});
	});
});
