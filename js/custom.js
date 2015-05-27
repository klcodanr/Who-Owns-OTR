---
---

$(document).ready(function(){
	var map = new google.maps.Map(document.getElementById('map-canvas'), {
		center: { lat: 39.114329, lng: -84.516449},
		zoom: 15
	});
	var markers = [];
	var locations = null;
	var properties = null;
	var useCategories = null;
	var useCode = null;
	var owner = null;
	var streetName = null;
	
	
	// residential rgb(235, 126, 9);
	// commericial rgb(44, 153, 28)
	var iconMappings = {
		industrial: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAL0lEQVQIW2NkwAMYQXKvb3D+F9X4zgijYerBAuiaQQpBYlglQRIgBTgl8eokKAkAs60YaSxUiugAAAAASUVORK5CYII=",
		multiresidence: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAKklEQVQIW2N8Xcf5nwEKRJu+MyLzwRyRxm8Mb+q5GNBpFJUwSZhJA6ETAI8WOR9e5KR2AAAAAElFTkSuQmCC",
		mixeduse: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAN0lEQVQIW2N8Xcf5nwEKRJu+M/7//x/OZwRJijR+Y3hTz8UAopEBWBJFBImDohMkDtMNMolGOgHnbyc11/dvBwAAAABJRU5ErkJggg==",
		commercial: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAMklEQVQIW2P8////fwYcgBEkqTtLFkP6ctpjBrgkiANShEzTWueV9CeMOjNl/sNokN0AO4ZB7EaWScQAAAAASUVORK5CYII=",
		other: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGElEQVQYV2NkYGD4z0AEYBxViC+UqB88AKk6CgGQfUVbAAAAAElFTkSuQmCC"
 /*
 - education - blue hat 
 - food - green cup
 - health - red cross on white
 - parking - black
 - vacant - green box
 - house - orange house
 - municipal - grey box
 - parks - green tree
 - churches - gold cross*/
	}
	
	// load from the query strings
	
	$.QueryString = (function(a) {
			if (a == "") return {};
			var b = {};
			for (var i = 0; i < a.length; ++i)
			{
					var p=a[i].split('=');
					if (p.length != 2) continue;
					b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
			}
			return b;
		})(window.location.search.substr(1).split('&'));
	if($.QueryString['useCode'] != null && 
			$.QueryString['useCode'] != ""){
		useCode = $.QueryString['useCode'].split(' ')[0];
		$('#map-controls input[name=useCode]').val($.QueryString['useCode']);
	}
	if($.QueryString['owner'] != null && 
			$.QueryString['owner'] != ""){
		owner = $.QueryString['owner'];
		$('#map-controls input[name=owner]').val($.QueryString['owner']);
	}
	if($.QueryString['streetName'] != null && 
			$.QueryString['streetName'] != ""){
		streetName = $.QueryString['streetName'];
		$('#map-controls input[name=streetName]').val($.QueryString['streetName']);
	}
	var getIcon = function(property){
		var type = "other";
		if(useCategories[property.usecode] && useCategories[property.usecode].type){
			type = useCategories[property.usecode].type;
		}
		if(iconMappings[type]){
			return iconMappings[type];
		} else {
			return iconMappings["other"];
		}
	}
	var displayProperty = function(property){
		var display = true;
		if(useCode != null && useCode != property.usecode){
			display = false;
		}
		if(owner != null && owner != property.owner){
			display = false;
		}
		if(streetName != null && streetName != property.streetname){
			display = false;
		}
		return display;
	};
	$.when(
		$.getJSON('{{ site.baseurl }}/data/locations.json', function(data) {
			locations = data;
		}),
		$.getJSON('{{ site.baseurl }}/data/properties.json', function(data) {
			properties = data;
		}),
		$.getJSON('{{ site.baseurl }}/data/use-categories.json', function(data) {
			useCategories = data;
		})
	).then(function() {
		var owners = {};
		var streets = {};
		$.each(properties, function(idx, property){
			var location = locations[property.address];
			if(location && location != null) {
				var latLng = new google.maps.LatLng(location.location.lat,location.location.lng);
				var marker = null;
				var icon = getIcon(property);
				if(displayProperty(property)){
					marker = new google.maps.Marker({
						position: latLng,
						map: map,
						title: location.address,
						icon: icon
					});
				} else {
					marker = new google.maps.Marker({
						position: latLng,
						map: null,
						title: location.address,
						icon: icon
					});
				}
				google.maps.event.addListener(marker, 'click', function() {				
					$('#map-controls .modal-body').hide();
					$(this).removeClass('btn-danger');
					$(this).addClass('btn-success');
					var id = 'property-'+property.address.replace(' ','-');
					if($('#'+id).length == 0){
						$.Mustache.load('{{ site.baseurl }}/templates/property.html').done(function () {

							$('body').mustache('property-modal', {
								property: property,
								location: location,
								useCategory: useCategories[property.usecode],
								id: id
							});
							$('#'+id).modal('show');
							// Set up the map and enable the Street View control.
							var mp = new google.maps.Map(document.getElementById(id +'-streetview'),{
								center: latLng,
								zoom: 16
							});
							panorama = mp.getStreetView();
							panorama.setOptions({
								position: latLng,
								visible: true
							});
							$('#'+id+' a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
								panorama.setVisible(true);
							});
						});
					} else {
						$('#'+id).modal('show');
					}
    			});
				markers.push({ 
					property: property,
					marker: marker
				});
				owners[property.owner] = property.owner;
				streets[property.streetname] = property.streetname;
			}
		});
		
		// drive the category selection
		var categoryStrings = [];
		$.each(useCategories, function(idx, elem){
			categoryStrings.push(elem.useCategory + ' - ' + elem.description);
		});
		$('#map-controls input[name=useCode]').typeahead({
			source: categoryStrings,
			items: 8
		});
		
		// drive the owner selection
		var ownerList = [];
		$.each(owners, function(idx, owner){
			ownerList.push(owner);
		});
		ownerList.sort();
		$('#map-controls input[name=owner]').typeahead({
			source: ownerList,
			items: 5
		});
		
		// drive the street name selection
		var streetNames = [];
		$.each(streets, function(idx, street){
			streetNames.push(street);
		});
		streetNames.sort();
		$('#map-controls input[name=streetName]').typeahead({
			source: streetNames,
			items: 3
		});
	});
	if ( useCode != null || owner != null || streetName != null ) {
		$('#map-controls .modal-body').hide();
	} else {
		$('#showHide').html('Hide');
		$('#showHide').removeClass('btn-success');
		$('#showHide').addClass('btn-danger');
	}
	$('#map-controls form').submit(function(){
		if($('#map-controls input[name=streetName]').val() != ""){
			streetName = $('#map-controls input[name=streetName]').val();
		} else {
			streetName = null;
		}
		if($('#map-controls input[name=useCode]').val() != ""){
			useCode = $('#map-controls input[name=useCode]').val().split(' ')[0];
		} else {
			useCode = null;
		}
		if($('#map-controls input[name=owner]').val() != ""){
			owner = $('#map-controls input[name=owner]').val();
		} else {
			owner = null;
		}
		$.each(markers, function(idx, marker){
			if(displayProperty(marker.property)){
				marker.marker.setMap(map);
			} else {
				marker.marker.setMap(null);
			}
		});
		$('#map-controls').modal("hide");
		return false;
	});
	$('#showHide').click(function(){
		if($(this).text() == 'Show'){
			$(this).html('Hide');
			$('#map-controls .modal-body').show();
			$(this).removeClass('btn-success');
			$(this).addClass('btn-danger');
		} else {
			$(this).html('Show');
			$('#map-controls .modal-body').hide();
			$(this).removeClass('btn-danger');
			$(this).addClass('btn-success');
		}
	});
	
});