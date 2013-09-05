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

var initializeInputs = function(){
	$('.objectDetails input,.objectDetails select,.objectDetails textarea').change(function() {
		$(this).attr('data-changed',"1");
	});
}

var getDateString = function(dateArray){
	var dateString = "";
	if(dateArray.length == 3){
		for(var i=0;i<3;i++){
			pad = "-00";
			dateArray[i] = dateArray[i].toString();
			pad = pad.substring(0, pad.length - dateArray[i].length) + dateArray[i];
			dateString += pad;
		}
	}
	return dateString;
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
			toastr.success('Object updated successfully');
			$(selector).attr('data-changed',"0");
			$('#versionSequence').val(version);
		},
		error: function (request,error) {
			console.log(error);
			toastr.error("Object couldn't be updated!");
		}
	});
}

var updateObjectPage = function(objectDetails, put_url){
	$('#objectCollectionsList').empty();
	$('#objectActionsList').empty();
	for(var detail in objectDetails){
		if(objectDetails[detail].memberType == "property"){
			if($("#"+detail).length > 0){
				if(typeof objectDetails[detail].value == 'boolean'){
					if(objectDetails[detail].value){
						$("#"+detail).val('on');
						$("#"+detail).slider('refresh');
					} else {
						$("#"+detail).val('off');
						$("#"+detail).slider('refresh');
					}
				} else {
					$("#"+detail).val(objectDetails[detail].value);
				}
				$("#"+detail).attr('data-href',objectDetails[detail].links[0].href);
			}
		} else if(objectDetails[detail].memberType == "collection"){
			if(objectDetails[detail].disabledReason == null){
							$('#objectCollectionsList').append('<li data-theme="c"><a class="objectCollection" data-href="'+objectDetails[detail].links[0].href+'" data-transition="slide" data-disabled="0">'+detail+'</a></li>');
			} else {
				$('#objectCollectionsList').append('<li data-theme="c"><a class="objectCollection" data-href="'+objectDetails[detail].links[0].href+'" data-transition="slide" data-disabled="'+objectDetails[detail].disabledReason+'">'+detail+'</a></li>');
			}
		} else if(objectDetails[detail].memberType == "action"){
			if(objectDetails[detail].disabledReason == null){
				$('#objectActionsList').append('<li data-theme="c"><a class="objectAction" data-href="'+objectDetails[detail].links[0].href+'" data-transition="slide" data-disabled="0">'+detail+'</a></li>');
			} else {
				$('#objectActionsList').append('<li data-theme="c"><a class="objectAction" data-href="'+objectDetails[detail].links[0].href+'" data-transition="slide" data-disabled="'+objectDetails[detail].disabledReason+'">'+detail+'</a></li>');
			}
		}
	}
	if ($('#objectCollectionsList').hasClass('ui-listview')) {
		$('#objectCollectionsList').listview('refresh');
	} else {
		$('#objectCollectionsList').trigger('create');
	}
	if ($('#objectActionsList').hasClass('ui-listview')) {
		$('#objectActionsList').listview('refresh');
	} else {
		$('#objectActionsList').trigger('create');
	}
	$('#editObject').attr('data-href',put_url);
}

$(document).ready(function(){
	//initializeInputs();
	toastr.options = {
		"debug": false,
		"positionClass": "toast-bottom-full-width",
		"onclick": null,
		"fadeIn": 300,
		"fadeOut": 1000,
		"timeOut": 3000,
		"extendedTimeOut": 1000
	};
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
					toastr.error('Username and Password donot match!');
				}
			});
		} else {
			toastr.error('All fields are required.');
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
				toastr.error('Username and Password donot match!');
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
					toastr.error('Username and Password donot match!');
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
				updateObjectPage(objectDetails, put_url);
			},
			error: function (request,error) {
				console.log(error);
				toastr.error('Username and Password donot match!');
			}
		});
    });
	
	$('.objectCollection').livequery("click",function(){
		var disabled = $(this).attr('data-disabled');
		if(disabled != 0){
			toastr.info(disabled);
		} else{
			$('#similarObjects').load('../Content/partials/objects.html', function(){
				$(this).trigger("pagecreate");
			});
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
					var objects = data.value;
					console.log(objects);
					$.mobile.changePage("#similarObjects");
					$('#similarObjects #objectsList').empty();
					for(i = 0; i < objects.length; i++){
						$('#similarObjects #objectsList').append('<li data-theme="c"><a class="object" data-href="'+objects[i].href+'" data-transition="slide">'+objects[i].title+'</a></li>');
					}
					$('#similarObjects #objectsList').listview('refresh');
				},
				error: function (request,error) {
					console.log(error);
					toastr.error('Username and Password donot match!');
				}
			});
		}
    });
	
	$('.objectAction').livequery("click",function(){
		var disabled = $(this).attr('data-disabled');
		if(disabled != 0){
			toastr.warning(disabled);
		} else{
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
					var links = data.links;
					console.log(links);
					/*for(i = 0; i < links.length; i++){
						if(links[i].indexOf("invoke") != -1){
							break;
						}
					}
					var invoke_url = links[i].href;*/
					var invoke_url = links[2].href;
					var invoke_method = links[2].method;
					if(invoke_method == "GET"){
						$.ajax({
							type: invoke_method,
							url: invoke_url,
							beforeSend: function(xhr) {
								//xhr.setRequestHeader("Authorization", header);
								xhr.setRequestHeader("Accept", "application/json");
								$.mobile.showPageLoadingMsg(true);
							},
							complete: function() {
								$.mobile.hidePageLoadingMsg();
							},
							success: function (data) {
								var resultType = data.resulttype;
								var objects = data.result.value;
								if(resultType == "list"){
									/*$('#similarToObjects').load('../Content/partials/similarObjects.html', function(){
										$(this).trigger("pagecreate");
									});*/
									$.mobile.changePage("#similarToObjects");
									$('#similarToObjects #objectsSimilarList').empty();
									console.log(objects);
									for(i = 0; i < objects.length; i++){
										console.log("Children length: "+$('#similarToObjects #objectsSimilarList').children().length);
										$('#similarToObjects #objectsSimilarList').append('<li data-theme="c"><a class="object" data-href="'+objects[i].href+'" data-transition="slide">'+objects[i].title+'</a></li>');
										console.log("Children length: "+$('#similarToObjects #objectsSimilarList').children().length);
									}
									console.log("Children length: "+$('#similarToObjects #objectsSimilarList').children().length);
									$('#similarToObjects #objectsSimilarList').listview('refresh');
								}
							},
							error: function (request,error) {
								console.log(error);
								toastr.error('Username and Password donot match!');
							}
						});
					} else if(invoke_method == "POST"){
						var params = data.parameters;
						var id = data.id;
						if(params.length <= 0){
							$.ajax({
								type: invoke_method,
								url: invoke_url,
								beforeSend: function(xhr) {
									//xhr.setRequestHeader("Authorization", header);
									xhr.setRequestHeader("Accept", "application/json");
									$.mobile.showPageLoadingMsg(true);
								},
								complete: function() {
									$.mobile.hidePageLoadingMsg();
								},
								success: function (data) {
									var resultType = data.resulttype;
									var objects = data.result.value;
									if(resultType == "list"){
										$.mobile.changePage("#objects");
										$('#objects #objectsList').empty();
										console.log(objects);
										for(i = 0; i < objects.length; i++){
											$('#objects #objectsList').append('<li data-theme="c"><a class="object" data-href="'+objects[i].href+'" data-transition="slide">'+objects[i].title+'</a></li>');
										}
										$('#objects #objectsList').listview('refresh');
									} else if(resultType == "domainobject"){
										updateObjectPage(data.result.members, data.result.links[2].href);
										$.mobile.changePage("#object");
									}
								},
								error: function (request,error) {
									console.log(error);
									toastr.error('Username and Password donot match!');
								}
							});
						} else if(params.length == 4){
							$( "#duplicateObject .duplicateDetails form div" ).each(function( index ){
								if(index < params.length){
									$(this).empty();
									$(this).append('<label for="'+params[index].id+'">'+params[index].name+'</label>');
									if(typeof params[index].choices != 'undefined'){
										console.log("In choices "+params[index].choices);
										$(this).append('<select name="'+params[index].id+'" id="'+params[index].id+'" ></select>');
										for (var i = 0; i < params[index].choices.length; i++) {
											if(params[index].choices[i] == params[index].default){
												$(this).children("select").append($('<option />',{'value': params[index].choices[i], 'selected': 'selected'}).text(params[index].choices[i]));
											} else {
												$(this).children("select").append($('<option />',{'value': params[index].choices[i]}).text(params[index].choices[i]));
											}
										}
										$(this).children("select").selectmenu();
										$(this).children("select").selectmenu( "refresh", true );
									} else {
										if(params[index].id.indexOf("due") != -1){
											console.log("Date: "+params[index].default[0].length);
											$(this).append('<input name="'+params[index].id+'" id="'+params[index].id+'" placeholder="" value="'+getDateString(params[index].default)+'" type="date">');
										} else if(params[index].id.indexOf("cost") != -1){
											$(this).append('<input name="'+params[index].id+'" id="'+params[index].id+'" placeholder="" value="'+params[index].default+'" type="number">');
										} else{
											$(this).append('<input name="'+params[index].id+'" id="'+params[index].id+'" placeholder="" value="'+params[index].default+'" >');
										}
									}
								}
							});
							$('#duplicateObject .duplicateDetails .createObject').attr('data-href',invoke_url);
							$.mobile.changePage("#duplicateObject");
						} else if(params.length == 1){
							if(id === "add"){
								$('#addDependency').load('../Content/partials/addDependency.html', function(){
									$(this).trigger("pagecreate");
								});
								$.ajax({
									url: isisURL+"restful/services/toDoItems/actions/allToDos/invoke",
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
										for(i = 0; i < objects.length; i++){
											if(invoke_url.indexOf(objects[i].href) == -1){
												$("#addDependency #addDependencyMenu").append($('<option />',{'value': objects[i].href}).text(objects[i].title));
											} else {
												$("#addDependency #addDependencyMenu").append($('<option />',{'value': objects[i].href, 'disabled': 'disabled'}).text(objects[i].title));
											}
										}
										$("#addDependency #addDependencyMenu").selectmenu();
										$("#addDependency #addDependencyMenu").selectmenu( "refresh", true );
										$("a.addDependency").attr("data-href", invoke_url);
										$.mobile.changePage("#addDependency");
									},
									error: function (request,error) {
										console.log(error);
										toastr.error('Username and Password donot match!');
									}
								});
							} else if(id === "remove"){
								$('#removeDependency').load('../Content/partials/removeDependency.html', function(){
									var objects = params[0].choices;
									console.log(objects);
									$.mobile.changePage("#removeDependency");
									for(i = 0; i < objects.length; i++){
										console.log("In loop"+objects);
										$("#removeDependency #removeDependencyMenu").append($('<option />',{'value': objects[i].href}).text(objects[i].title));
									}
									$("#removeDependency #removeDependencyMenu").selectmenu();
									$("#removeDependency #removeDependencyMenu").selectmenu( "refresh", true );
									$("a.removeDependency").attr("data-href", invoke_url);
									$(this).trigger("pagecreate");
								});
								/*var objects = params[0].choices;
								console.log(objects);
								$.mobile.changePage("#removeDependency");
								for(i = 0; i < objects.length; i++){
									console.log("In loop"+objects);
									$("#removeDependency #removeDependencyMenu").append($('<option />',{'value': objects[i].href}).text(objects[i].title));
								}
								$("#removeDependency #removeDependencyMenu").selectmenu();
								$("#removeDependency #removeDependencyMenu").selectmenu( "refresh", true );
								$("a.removeDependency").attr("data-href", invoke_url);*/
								//$.mobile.changePage("#removeDependency");
							} else {
								$( "#updateObject .updateDetails form div" ).each(function( index ){
									if(index < params.length){
										$(this).empty();
										$(this).append('<label for="'+params[index].id+'">'+params[index].name+'</label>');
										if(params[index].id.indexOf("Date") != -1){
											$(this).append('<input name="'+params[index].id+'" id="'+params[index].id+'" placeholder="" value="" type="date">');
										} else if(params[index].id.indexOf("Cost") != -1){
											$(this).append('<input name="'+params[index].id+'" id="'+params[index].id+'" placeholder="" value="" type="number">');
										} else{
											$(this).append('<input name="'+params[index].id+'" id="'+params[index].id+'" placeholder="" value="'+params[index].default+'" >');
										}
									}
								});
								$('#updateObject .updateDetails .updateObject').attr('data-href',invoke_url);
								$.mobile.changePage("#updateObject");
							}
						}
					}
				},
				error: function (request,error) {
					console.log(error);
					toastr.error('Username and Password donot match!');
				}
			});
		}
    });
	
	$("a.addDependency").livequery("click",function(){
		var objectHref = $("#addDependency #addDependencyMenu").val();
		var dependencyObject = {"toDoItem":{"value": { "href": objectHref } }} ;
		dependencyObject = JSON.stringify(dependencyObject);
		console.log(dependencyObject);
		$.ajax({
			type: "POST",
			url: $(this).attr('data-href'),
			data: dependencyObject,
			beforeSend: function(xhr) {
				//xhr.setRequestHeader("Authorization", header);
				xhr.setRequestHeader("Accept", "application/json");
				$.mobile.showPageLoadingMsg(true);
			},
			complete: function() {
				$.mobile.hidePageLoadingMsg();
			},
			success: function (data) {
				window.history.back();
				updateObjectPage(data.result.members, data.result.links[2].href);
				toastr.success('Object dependency added successfully');
			},
			error: function (request,error) {
				console.log(error);
				toastr.error('Username and Password donot match!');
			}
		});
	});
	
	$("a.removeDependency").livequery("click",function(){
		var objectHref = $("#removeDependency #removeDependencyMenu").val();
		var dependencyObject = {"toDoItem":{"value": { "href": objectHref } }} ;
		dependencyObject = JSON.stringify(dependencyObject);
		console.log(dependencyObject);
		$.ajax({
			type: "POST",
			url: $(this).attr('data-href'),
			data: dependencyObject,
			beforeSend: function(xhr) {
				//xhr.setRequestHeader("Authorization", header);
				xhr.setRequestHeader("Accept", "application/json");
				$.mobile.showPageLoadingMsg(true);
			},
			complete: function() {
				$.mobile.hidePageLoadingMsg();
			},
			success: function (data) {
				window.history.back();
				updateObjectPage(data.result.members, data.result.links[2].href);
				toastr.success('Object dependency removed successfully');
			},
			error: function (request,error) {
				console.log(error);
				toastr.error('Username and Password donot match!');
			}
		});
	});
	
	$('.createObject, .updateObject').click(function(){
		var newDetails = JSON.stringify($(this).parent().children('form').serializeObject());
		console.log(newDetails);
		var updateUrl = $(this).attr('data-href');
		var toastMsg = "Object updated sucessfully";
		if(updateUrl.indexOf("duplicate") != -1){
			toastMsg = "Object duplicated sucessfully";
		}
		$.ajax({
			type: "POST",
			url: updateUrl,
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
				toastr.success(toastMsg);
				$.mobile.changePage("#service");
			},
			error: function (request,error) {
				console.log(error);
				toastr.error('Username and Password donot match!');
			}
		});
	});
	
	$('#editObject').click(function(){
		var newDetails = JSON.stringify($('.objectDetails form').serializeObject());
		console.log(newDetails);
		var version = parseInt($('#versionSequence').val()) + 1;
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
				$('#versionSequence').val(version);
				toastr.success('Object updated successfully');
			},
			error: function (request,error) {
				console.log(error);
				toastr.error('Username and Password donot match!');
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
				toastr.success('Object created successfully');
				$.mobile.changePage("#service");
			},
			error: function (request,error) {
				console.log(error);
				toastr.error('Username and Password donot match!');
			}
		});
	});
});
