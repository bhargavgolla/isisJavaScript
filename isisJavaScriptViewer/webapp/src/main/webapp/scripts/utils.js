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