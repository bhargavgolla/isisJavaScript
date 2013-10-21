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

var updateObjectPage = function(objectDetails, put_url){
	$('#objectCollectionsList').empty();
	$('#objectActionsList').empty();
	for(var detail in objectDetails){
		if(objectDetails[detail].memberType == "property"){
			if($("#"+detail).length > 0){
				if(typeof objectDetails[detail].value == 'boolean'){
					if(objectDetails[detail].value){
						$("#"+detail).val('on');
						$("#"+detail).slider().slider('refresh');
					} else {
						$("#"+detail).val('off');
						$("#"+detail).slider().slider('refresh');
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

var getString = function(string){
	if(typeof string != 'undefined') {
		return string;
	}
	return '';
}

var htmlForParameters = function (parameters, invoke_url, invoke_method){
	var htmlContent = '<form action="" method="POST">';
	for(i = 0; i < parameters.length; i++){
		//Select menu
		if (typeof parameters[i].choices != 'undefined') {
			htmlContent += '<div data-role="fieldcontain"><label for="'+parameters[i].id+'">'+parameters[i].name+'</label>';
			htmlContent += '<select name="'+parameters[i].id+'" id="'+parameters[i].id+'" >';
			for (var j = 0; j < parameters[i].choices.length; j++) {
				if(parameters[i].choices[j] == parameters[i]["default"]){
					htmlContent += '<option value="'+parameters[i].choices[j]+'" selected>'+parameters[i].choices[j]+'</option>';
				} else {
					htmlContent += '<option value="'+parameters[i].choices[j]+'">'+parameters[i].choices[j]+'</option>';
				}
			}
			htmlContent += '</select></div>';
		} else if (parameters[i].id.toLowerCase().indexOf("due") != -1) {
			htmlContent += '<div data-role="fieldcontain"><label for="'+parameters[i].id+'">'+parameters[i].name+'</label><input name="'+parameters[i].id+'" id="'+parameters[i].id+'" placeholder="" value="'+getDateString(parameters[i]["default"])+'" type="date"></div>';
		} else if (parameters[i].id.toLowerCase().indexOf("cost") != -1) {
			htmlContent += '<div data-role="fieldcontain"><label for="'+parameters[i].id+'">'+parameters[i].name+'</label><input name="'+parameters[i].id+'" id="'+parameters[i].id+'" placeholder="" value="'+parameters[i]["default"]+'" type="number"></div>';
		} else if (  parameters[i].id.toLowerCase().indexOf("date") != -1) {
			htmlContent += '<div data-role="fieldcontain"><label for="'+parameters[i].id+'">'+parameters[i].name+'</label><input name="'+parameters[i].id+'" id="'+parameters[i].id+'" placeholder="" value="" type="date"></div>';
		} else {
			htmlContent += '<div data-role="fieldcontain"><label for="'+parameters[i].id+'">'+parameters[i].name+'</label><input name="'+parameters[i].id+'" id="'+parameters[i].id+'" placeholder="" value="'+getString(parameters[i]["default"])+'" type="text"></div>';
		}
	}
	htmlContent += '</form><a data-role="button" data-href="'+invoke_url+'" data-method="'+invoke_method+'" class="parameterSubmit">Submit</a>';
	return htmlContent;
}

var handleResult = function(data){
	var resultType = data.resulttype;
	var objects = data.result.value;
	if(resultType == "list"){
		window.history.back();
		toastr.success("Action performed successfully");
		/* $.mobile.changePage("#objects");
		$('#objects #objectsList').empty();
		console.log(objects);
		for(i = 0; i < objects.length; i++){
			$('#objects #objectsList').append('<li data-theme="c"><a class="object" data-href="'+objects[i].href+'" data-transition="slide">'+objects[i].title+'</a></li>');
		}
		$('#objects #objectsList').listview('refresh'); */
	} else if(resultType == "domainobject"){
		window.history.back();
		toastr.success("Action performed successfully");
	}  else if(resultType == "scalarvalue"){
		toastr.success(objects);
		window.history.back();
	}
}