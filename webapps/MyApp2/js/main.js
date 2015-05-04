// initialize the mapping app

// saving global var
var map;
var layersArray = [];
var popup;




function init(){

	////////////////////////////////////////////////////////
	// MAP + VIEW
	////////////////////////////////////////////////////////
	map = new ol.Map({
		target:'map',
		renderer:'canvas',
		//instanciate and set a view
		view: new ol.View({
			projection: 'EPSG:900913',
			// Hardcode a view entry Point
			center:[158589,5395952],
			zoom:8
		})
	});

	////////////////////////////////////////////////////////
	// LAYERS
	////////////////////////////////////////////////////////
	var baseLayer = new ol.layer.Tile({
		source: new ol.source.OSM()
	});


	// Source the vector features
	var coll32source = new ol.source.GeoJSON({
		url: './college_32_source.geojson',	
	});
	// Create a vector layer to display the features within the GeoJSON source and
	// applies a simple icon style to all features
	var coll32Layer = new ol.layer.Vector({
    	title: 'collèges Gers (32)',
    	source: coll32source,
    	
    	style: new ol.style.Style({
        	image: new ol.style.Icon(({
        		anchor: [0.5, 40],
        		scale: 0.1,
		        anchorXUnits: 'fraction',
		        anchorYUnits: 'pixels',
		        src: './marker.png'
		    }))
    	})
    });  


	// Source a WFS vector features
	var coll12source = new ol.source.GeoJSON({
		url: 'http://spatialapp-pfo2015.rhcloud.com/first/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=first:college_public_12&maxFeatures=50&outputFormat=application%2Fjson',	
	});
	// Create corresponding ol.layer.Vector with style
	var coll12Layer =  new ol.layer.Vector({
		title: 'collèges Aveyron (12)',
      	source: coll12source,

		style: new ol.style.Style({
        	image: new ol.style.Icon(({
        		anchor: [0.5, 40],
        		scale: 0.1,
		        anchorXUnits: 'fraction',
		        anchorYUnits: 'pixels',
		        src: './marker.png'
		    }))
    	})
    });



	var coll_pub_31 = new ol.layer.Tile({
        
        source: new ol.source.TileWMS({
        // Attempt to keep Layer stay in memory
        preload: Infinity,
        url: 'http://spatialapp-pfo2015.rhcloud.com:80/first/wms',
        // Contains the layer requested from GeoServer
        attributions: [new ol.Attribution({
      		html:"Open Licence "
    		})],
        params: {
                   	'TILED': true,
                   	'LAYERS': 'first:colleges_public_31',
                   	'STYLES': '',
                	'projection':"EPSG:900913",
                	'attribution': "Vector Attribution in 2nd arg",
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

	// Stack layers when adding them to the map 
	map.addLayer(baseLayer);
	map.addLayer(untiled);
	map.addLayer(coll32Layer); 
	map.addLayer(coll12Layer);

	layersArray.push(baseLayer); //0
	layersArray.push(untiled); //1
	layersArray.push(coll32Layer); //2
	layersArray.push(coll12Layer); //2

	
	
	////////////////////////////////////////////////////////
	// CONTROLS
	////////////////////////////////////////////////////////

	// Attribution
	var myControlAttribution = new ol.control.Attribution({
		//kept all defaults
	});
	map.addControl(myControlAttribution);

	// ScaleBar
	var myControlScale = new ol.control.ScaleLine({
	});
	map.addControl(myControlScale);


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
	// MOUSE EVENTS 
	////////////////////////////////////////////////////////
	map.on('singleclick', function(evt) {
		
		var coord = evt.coordinate;
		var viewProjection = map.getView().getProjection();
		var viewResolution = map.getView().getResolution();
		var url = coll_pub_31.getSource().getGetFeatureInfoUrl(coord, viewResolution, viewProjection, {
			'INFO_FORMAT' : 'application/json', 'FEATURE_COUNT': 1
		});

		

		// Attempt to find a marker from the coll32Layer
        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
          return feature;
        });

        if (feature) {
        	var items = [];;
        	var props = feature.getProperties();

        	$.each(props, function(key, val) {
        		console.log(key,val)
        		if (key != "geometry")
					items.push( "<li id='" + key + "'>" + val + "</li>" );
			});
        	
        	spawnPopup(coord);

	        
	        // jQuery, build an unordered List 
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

	if (layers.a.length > 1)
    	layers.pop();
}

function swapTopLayer(){
	// get reference for the object collection of layer
	var layers = map.getLayers();
	if (layers.a.length > 2){
		// reference to the top-level layer (lastly added)
		var topLayer = layers.removeAt(2);
		// send to back (above base layer)
		layers.insertAt(1, topLayer);
	}
}

// Layer visibility function
function layerswitch(evt){
	layersArray[evt.value].setVisible(evt.checked);
}