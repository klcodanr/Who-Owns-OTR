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
	
	// industrial ccbb04
	// residential EB7E00;
	// park/vacant 2C991C
	// commercial 6b07ad
	// health f50303
	// church FFD700
	var iconMappings = {
		church: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAMUlEQVQYV2PMZl/7nwEJTLkQDOblGKxFFmZgJEkhzBQUI5A4INPBJhKtkPpuHOQmAgBmyTM3Y41FHgAAAABJRU5ErkJggg==",
		commercial: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAKklEQVQYV2NkIBIwgtRls6/9j0/91J/BjHCFIA6yJmQ+isJRE9FDABQ8AKF5RAvN8G1DAAAAAElFTkSuQmCC",
		education: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAR0lEQVQYV2NkQANeLr/+g4S27WFjRJZC4YAkiFIIUwQzCdlUuInoitAVgxUiK4KZgi7GiMs6dHEME9FDARYC5CvE6UZiPQMA2go2knA2XnUAAAAASUVORK5CYII=",
		food: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAOUlEQVQYV2NkIBIwEqmOAa5QZ6bMf2yarqQ/AashqBCmmaBCkIkg2wZAIUluRPE1iIMeRLCgAckBAAOeIWvcifSZAAAAAElFTkSuQmCC",
		health: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAMUlEQVQYV2P8////fwYk8I2FBczj+vMHWZiBcQAVfmVmRnEjisOQOIxEKxxAzxBrNQA2ZTvfJo+G3AAAAABJRU5ErkJggg==",
		house: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAASklEQVQYV2NkIBIwoqt7XcfwHyQm2sSAIofCgSmCaUZWDFeIrghdMVghLkXIihkJKYIpJt5EmNUgh2PzDEgMJIdhIsynyJpIUggAAOcmc7tJ3u0AAAAASUVORK5CYII=",
		industrial: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAANElEQVQYV2NkIBIwgtSd2c3y38T1DwYb2QziFYJMw2c7zCZGQgpBhoAUD5BCkPVEWU2SQgB2WyepcAdWWgAAAABJRU5ErkJggg==",
		mixeduse: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAASElEQVQYV2N8XcfwnwEJiDYxMIK4////RxFnBCkUaYSIvalnZACxGRkZGbEqRDYRr0J0E5E1wthgq7FJoIthdSOye2HsoWAiANDySmvMFJhmAAAAAElFTkSuQmCC",
		multiresidence: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAP0lEQVQYV2N8XcfwnwEJiDYxMIK46OKMIAGRRojaN/WMDCA2IyMjhjhYANlEZIXI4lhNRDYdxsZqIkxy2JoIANVfVhvYfurJAAAAAElFTkSuQmCC",
		public: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAQUlEQVQYV2NkIBIwIqubM2fOf2R+SkoKXB7OQFcE0wBTDFaISxGyYkZCimCKSVMIcgfIZBgNMgVdDEUB9RQSE+YAnHZM/YOCpcsAAAAASUVORK5CYII=",
		park: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAASElEQVQYV2P8////fwYkIFPID+Y96f+ILMzASJZCmGkwo5BNRTGRKIXoitBNhZtIlEJcipBNBZtItEKiwlG6gA8lwFFCGYkDAHAZQH+9ftttAAAAAElFTkSuQmCC",
		parking: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAANklEQVQYV2NkYGD4z0AEYIQp/P8fVT0jI0gKAVAUIkuCNCLzaawQxU3EuhE9IHC6kXKFhMIcAAswKwGeIlp8AAAAAElFTkSuQmCC",
		vacant: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGElEQVQYV2PUmSnzn4EIwDiqEF8oUT94AFatEsvLX8CNAAAAAElFTkSuQmCC",
		other: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGElEQVQYV2NkYGD4z0AEYBxViC+UqB88AKk6CgGQfUVbAAAAAElFTkSuQmCC"
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
	function computeAngle(endLatLng, startLatLng) {
		var DEGREE_PER_RADIAN = 57.2957795;
		var RADIAN_PER_DEGREE = 0.017453;

		var dlat = endLatLng.lat() - startLatLng.lat();
		var dlng = endLatLng.lng() - startLatLng.lng();
		// We multiply dlng with cos(endLat), since the two points are very closeby,
		// so we assume their cos values are approximately equal.
		var yaw = Math.atan2(dlng * Math.cos(endLatLng.lat() * RADIAN_PER_DEGREE), dlat) * DEGREE_PER_RADIAN;
		return wrapAngle(yaw);
	}

	function wrapAngle(angle) {
		if (angle >= 360) {
			angle -= 360;
		} else if (angle < 0) {
			angle += 360;
		}
		return angle;
	};
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
						icon: {
							url: icon,
							size: new google.maps.Size(48, 48)
						}
					});
				} else {
					marker = new google.maps.Marker({
						position: latLng,
						map: null,
						title: location.address,
						icon: {
							url: icon,
							size: new google.maps.Size(48, 48)
						}
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
								var angle = computeAngle(latLng, panorama.location.latLng);
								panorama.setVisible(true);
								panorama.setPov({
									heading: angle,
									pitch: 10
								});
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