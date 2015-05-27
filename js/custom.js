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
				if(displayProperty(property)){
					marker = new google.maps.Marker({
						position: latLng,
						map: map,
						title: location.address
					});
				} else {
					marker = new google.maps.Marker({
						position: latLng,
						map: null,
						title: location.address
					});
				}
				google.maps.event.addListener(marker, 'click', function() {
    				$.Mustache.load('{{ site.baseurl }}/templates/property.html').done(function () {
    					var id = 'property-'+property.address.replace(' ','-');
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
						$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
							panorama.setVisible(true);
						});

					});
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
		$.each(markers, function(idx, marker){
			if(displayProperty(marker.property)){
				marker.setMap(map);
			} else {
				marker.setMap(null);
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