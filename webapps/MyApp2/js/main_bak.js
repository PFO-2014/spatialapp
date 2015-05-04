// initialize the mapping app

// saving global var
var map;
var popup;

var styleCache = {};

var geoLayer = new ol.layer.Vector({
    source : new ol.source.GeoJSON({
		projection : 'EPSG:900913',
		url : './myGeoJSON.geojson'
	}),
	style : function(feature, resolution) {
		var text = resolution < 5000 ? feature.get('name') : '';
		if (!styleCache[text]) {
			styleCache[text] = [new ol.style.Style({
				fill : new ol.style.Fill({
					color : 'rgba(255, 255, 255, 0.1)'
				}),
				stroke : new ol.style.Stroke({
					color : '#319FD3',
					width : 1
				}),
				text : new ol.style.Text({
					font : '12px Calibri,sans-serif',
					text : text,
					fill : new ol.style.Fill({
						color : '#000'
					}),
					stroke : new ol.style.Stroke({
						color : '#fff',
						width : 3
					})
				}),
				zIndex : 999
			})];
		}
		return styleCache[text];
	}
});



function init(){
	//instanciate a ol.Map obj 
	map = new ol.Map({
		target:'map',
		renderer:'canvas',
		//instanciate and set a view
		view: new ol.View({
			projection: 'EPSG:900913',
			center:[158589,5395952],
			zoom:8
		})
	});

	var baseLayer = new ol.layer.Tile({
		source: new ol.source.OSM()
	});

	map.addLayer(baseLayer);

	var vectorLayer = new ol.layer.Tile({
		source: new ol.source.TileWMS({
			// Layer stay in memory
			preload: Infinity,
			url: 'http://felek.cns.umass.edu:8080/geoserver/wms',
			serverType:'geoserver',
			// Contains the layer requested from GeoServer
			params:{
				//layer_name:workspace:layer_name_on_geoserver, tiles: prevent unecessary load
				'LAYERS':"Streams:Developed", 'TILED':true
			}
		})
	});

	// vectorLayer is a ol.Layer, see ol.layer.Layer method to work with it
	vectorLayer.setOpacity(.3);
	// vectorLayer.setHue(1);
	// vectorLayer.setVisible(true);
	// vectorLayer.setSaturation(10);

	map.addLayer(vectorLayer);

	var coll_pub_31 = new ol.layer.Tile({
        
        source: new ol.source.TileWMS({
        // Attempt to keep Layer stay in memory
        preload: Infinity,
        url: 'http://spatialapp-pfo2015.rhcloud.com:80/first/wms',
        // Contains the layer requested from GeoServer
        params: {
                   	'TILED': true,
                   	'LAYERS': 'first:colleges_public_31',
                   	'STYLES': '',
                	'projection':"EPSG:900913"
          		}
        })
      });


	var untiled = new ol.layer.Image({
        source: new ol.source.ImageWMS({
          ratio: 1,
          url: 'http://spatialapp-pfo2015.rhcloud.com:80/first/wms',
          params: { 
                   'LAYERS': 'first:coll_pub_31',
                   'STYLES': '',
                   projection:"EPSG:900913"
          }
        })
      });



	map.addLayer(untiled)

	var vectorLayer_2 = new ol.layer.Tile({
		source: new ol.source.TileWMS({
			preload: Infinity,
			url: 'http://felek.cns.umass.edu:8080/geoserver/wms',
			serverType:'geoserver',
			params:{
				'LAYERS':"Streams:Deposition_of_Nitrogen", 'TILED':true
			}
		})
	});
	
	map.addLayer(vectorLayer_2);
	map.addLayer(geoLayer);
	
	////////////////////////////////////////////////////////
	// CONTROLS
	////////////////////////////////////////////////////////

	//Attribution
	var myControlAttribution = new ol.control.Attribution({
		//kept all defaults
	});
	map.addControl(myControlAttribution);

	//ZoomToExtent
	var myExtentButton = new ol.control.ZoomToExtent({
		// no extensions defined, repeat world
    	extent:undefined
	});
	map.addControl(myExtentButton);

	//ZoomSlider
	var myZoomSlider = new ol.control.ZoomSlider();
	map.addControl(myZoomSlider);
	//The zoom slider is a nice addition to your map. It is wise to have it accompany your zoom buttons.

	//Mouse Position
	var mousePositionControl = new ol.control.MousePosition({
	  className:'ol-full-screen', //default parameter
	  coordinateFormat:ol.coordinate.createStringXY(4), //This is the format we want the coordinate in. 
	  //The number arguement in createStringXY is the number of decimal places.
	  projection:"EPSG:900913", //This is the actual projection of the coordinates. 
	  //Luckily, if our map is not native to the projection here, the coordinates will be transformed to the appropriate projection.
	  className:"custom-mouse-position",
	  target:"coords", //define a target if you have a div you want to insert into already,
	  undefinedHTML: '&nbsp;' //what openlayers will use if the map returns undefined for a map coordinate.
	});
	map.addControl(mousePositionControl);

	////////////////////////////////////////////////////////
	// MOUSE EVENT
	////////////////////////////////////////////////////////
	map.on('singleclick', function(evt) {
		
		var coord = evt.coordinate;
		
		var viewProjection = map.getView().getProjection();
		var viewResolution = map.getView().getResolution();
		var url = coll_pub_31.getSource().getGetFeatureInfoUrl(coord, viewResolution, viewProjection, {
			'INFO_FORMAT' : 'application/json', 'FEATURE_COUNT': 50
		});
		if (url) {
			// AJAX REQUEST TO fecth geoJSON from WMS service layer
			// JQuery  $.getJSON(url, function(data) {...} failed,
			// only one request is authorized

			$.ajax({
			  type: "GET",
			  url: url,
			  //
			  success: function (result) {
			      //console.log(result);
			      var items = [];

		        	$.each( result, function( key, val ) {
		        		// Test if there is a features at picked loction
		        		if (key === "features" && !jQuery.isEmptyObject(val)){
		        		
		        		// console.log("here", jQuery.isEmptyObject(val));
		        		// console.log(val);

		        		spawnPopup(coord);
		 				
		 				$.each( val, function( key2, val2){
		 						$.each( val2, function( key3, val3){
		 							// alert(val2);
		 							// items.push( "<li id='" + key3 + "'>" + val3 + "</li>" );
		 							if (key3 === "properties"){
			 							$.each( val3, function( key4, val4){
				 						
				 						items.push( "<li id='" + key4 + "'>" + val4 + "</li>" );
				 						})
		 							}
		 						})
		 					})
		 				//jQuery, build an unordered List 
		 				$(function () {
		  				//wait for the popup to be ready
		  				$('#info.popup').ready(function () {
		  				//Construct an unordered list with items[]
		  				// then pass it to the popup
		    			$( "<ul/>", {
			    		"class": "my-new-list",
			   	 		html: items.join( "" )
			  			}).appendTo( '#info.popup' );
				  			});
						});





		 				}
		 				
		  			});

		
			  },
			  dataType: "json",
			  cache: false
			});


			

		} else {
			console.log("Uh Oh, something went wrong.");
		}

	});


	// map.on('singleclick', function(evt){
	// 	var coord = evt.coordinate;
	// 	// // for latter ref.
	// 	// var tr_coordinate = ol.proj.transform(coord, "EPSG:900913", "EPSG:4326");
	// 	// console.log(tr_coordinate, coord);
	// 	// Call user function
	// 	spawnPopup(coord);
	// 	var viewProjection = map.getView().getProjection();
	// 	var viewResolution = map.getView().getResolution();
	// 	var url = coll_pub_31.getSource().getGetFeatureInfoUrl(coord, viewResolution,
	// 	 viewProjection, {
	// 		'INFO_FORMAT' : 'application/json', 'FEATURE_COUNT': 50
	// 	});
	// 	if (url) {
	// 		console.log(url)
 //    		$.getJSON(url, function(data) {
 //        	console.log(data);
 //        	var items = [];
 //        	//For Dev: from parsing the GeoJSON
 //        	//alert(data.features[0].properties.statut);

 //        	$.each( data, function( key, val ) {
 //        		//alert(val);
 //        		if (key === "features"){
        			
 // 				$.each( val, function( key2, val2){
 // 						$.each( val2, function( key3, val3){
 // 							// alert(val2);
 // 							// items.push( "<li id='" + key3 + "'>" + val3 + "</li>" );
 // 							if (key3 === "properties"){
 // 								console.log("here")
	//  							$.each( val3, function( key4, val4){
		 						
	// 	 						items.push( "<li id='" + key4 + "'>" + val4 + "</li>" );
	// 	 						})
 // 							}
 // 					})
 						
 					
 // 				}) }      		
    			
 //  			});
 			
 // 			$( "<ul/>", {
 //    		"class": "my-new-list",
 //   	 		html: items.join( "" )
 //  			}).appendTo( "body" );

	// 		})
	// 	} else {
	// 	    console.log("Uh Oh, something went wrong.");
	// 	}
	// })

}

function spawnPopup(coord){
	// only one single popup is allowed for display
	if(!!popup){return;}

	popup = $("<div id='info' class='popup'><button class='closebtn' onclick='destroyPopup()'>Close</button></div>");
    
    // make ref to an openLayer overlay to act as the popup container
    var overlay = new ol.Overlay({
        element:popup
    });
    // Add ovrlay to the map
    map.addOverlay(overlay);
    // Attach Overlay to clicked position
    overlay.setPosition(coord);
}

function destroyPopup(){
	$(popup).remove();
	popup = null;
}

function removeTopLayer(){
	var layers = map.getLayers();
    layers.pop();
}

function swapTopLayer(){
	// get reference for the object collection of layer
	var layers = map.getLayers();
	// reference to the top-level layer (lastly added)
	var topLayer = layers.removeAt(2);
	// send to back (above base layer)
	layers.insertAt(1, topLayer);
}