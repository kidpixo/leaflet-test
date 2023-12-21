// myscript.js
// Updated by well-it-wasnt-me
// 10/12/2023

// Welcome to the brain of this operation - myscript.js
// Grab a drink, sit back, and let's make some map magic happen

// "I believe that if life gives you lemons, you should make lemonade... And try to find somebody whose life has given them vodka, and have a party!" - Ron White

var map = L.map("map", {
    center: [41.355946, 14.370868],
    zoom: 16,
    zoomControl: true,
    preferCanvas: false,
});

// add plugin leaflet-locatecontrol: A leaflet control to geolocate the user https://github.com/domoritz/leaflet-locatecontrol
L.control.locate().addTo(map);

// Let's lay down the base map, the canvas where our map artwork will unfold
var tile_layer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "Mixed by Kidpixo",
        detectRetina: false,
        maxNativeZoom: 19,
        maxZoom: 20,
<<<<<<< HEAD
        minZoom: 0,
=======
        minZoom: 2,
>>>>>>> 655728c (improvement: fixed disapperaing Bing layer at maxZoom, started identify layers in map._layers)
        noWrap: false,
        opacity: 1,
        subdomains: "abc",
        tms: false,
    }
);
// Drop it like it's hot on our map
tile_layer.addTo(map);
tile_layer.options['layer_id']='osm'

// Now, introducing the Bing Photo Layer - because regular maps are so last season
// P.S. Don't forget to insert your api key - https://www.bingmapsportal.com/
var bingLayer = new L.TileLayer.Bing('Ai2nLg63EqcX4-3ZTWHmKNQbUkcsnEYuVJGlD8V0GC83idoO0u8cu7AzD-UOz5KV', {
    type: 'AerialWithLabels', // You can change the type to 'AerialWithLabels' or 'Road'
    maxNativeZoom: 18,
    maxZoom: 20,
});
<<<<<<< HEAD
// // opacity in creation is not working!
// bingLayer.setOpacity(0.4);
=======
>>>>>>> 655728c (improvement: fixed disapperaing Bing layer at maxZoom, started identify layers in map._layers)
// Adding the Bing Photo Layer to our map
bingLayer.addTo(map);
// digidem/leaflet-bing-layer bug: options are ignored
// opacity in creation is not working!
bingLayer.setOpacity(0.4);
bingLayer.options['maxNativeZoom']=18
bingLayer.options['maxZoom']=map.getMaxZoom()
bingLayer.options['layer_id']='bing'

var geoRasterLayer;
var geoRasterLayer_2;

async function loadGeoRaster() {
    // add first georaster
    var url_to_geotiff_file = "https://kidpixo.github.io/leaflet-test/COG_1884_EPSG4326.tif";
    // var url_to_geotiff_file = "http://0.0.0.0:44000/COG_1884_EPSG4326.tif";
    var georaster = await parseGeoraster(url_to_geotiff_file, {'resampleMethod':'nearest'});

    geoRasterLayer = new GeoRasterLayer({
        debugLevel: 0,
        georaster:georaster,
        resolution: 256,
        opacity: 0.7,
    }).addTo(map);
    geoRasterLayer.options['layer_id']='1884'
 
    // add second georaster
    var url_to_geotiff_file_2 = "https://kidpixo.github.io/leaflet-test/COG_1964_EPSG4326.tif";
    // var url_to_geotiff_file_2 = "http://0.0.0.0:44000/COG_1964_EPSG4326.tif";
    var georaster_2 = await parseGeoraster(url_to_geotiff_file_2, {'resampleMethod':'nearest'});

<<<<<<< HEAD
 
    // add second georaster
    var url_to_geotiff_file_2 = "https://kidpixo.github.io/leaflet-test/COG_1964_EPSG4326.tif";
    // var url_to_geotiff_file_2 = "http://0.0.0.0:44000/COG_1964_EPSG4326.tif";
    var georaster_2 = await parseGeoraster(url_to_geotiff_file_2, {'resampleMethod':'nearest'});

    geoRasterLayer_2 = new GeoRasterLayer({
        debugLevel: 0,
        georaster:georaster_2,
        resolution: 256,
        opacity: 0.75,
    }).addTo(map);

=======
    geoRasterLayer_2 = new GeoRasterLayer({
        debugLevel: 0,
        georaster:georaster_2,
        resolution: 256,
        opacity: 0.7,
    }).addTo(map);
    geoRasterLayer_2.options['layer_id']='1964'

>>>>>>> 655728c (improvement: fixed disapperaing Bing layer at maxZoom, started identify layers in map._layers)
    // build layers group
    // basemaps
    var baseMaps = {
        "OpenStreetMap": tile_layer,
        // "Bing": bingLayer
    };
    // overlays, insert input range as title with ad-hoc IDs
<<<<<<< HEAD
    var overlayMaps = {
        'bing<input type="range" id="opacity-slider-bing" min="0" max="1" step="0.1" value="0.4" />': bingLayer,
        '1884<input type="range" id="opacity-slider-1884" min="0" max="1" step="0.1" value="0.4" />': geoRasterLayer,
        '1964<input type="range" id="opacity-slider-1964" min="0" max="1" step="0.1" value="0.4" />': geoRasterLayer_2,
=======
    // // try to get the layer opacity
    // var bingLayer_id ='bing<input type="range" id="opacity-slider-bing" min="0" max="1" step="0.1" value="'
    // bingLayer_id = bingLayer_id.concat(String(filter_layer_id('bing').options.opacity), '" />')
    // console.log( bingLayer_id );
    var overlayMaps = {
        'bing<input type="range" id="opacity-slider-bing" min="0" max="1" step="0.1" value="0.4" />': bingLayer,
        '1884<input type="range" id="opacity-slider-1884" min="0" max="1" step="0.1" value="0.7" />': geoRasterLayer,
        '1964<input type="range" id="opacity-slider-1964" min="0" max="1" step="0.1" value="0.7" />': geoRasterLayer_2,
>>>>>>> 655728c (improvement: fixed disapperaing Bing layer at maxZoom, started identify layers in map._layers)
    };
    // create global control
    var layerControl = L.control.layers(baseMaps, 
        overlayMaps,
        {"autoZIndex": true, "collapsed": false, "position": "topright"}
    ).addTo(map);

    // create listener for opacity input
    // opacity for 1884 layer : geoRasterLayer
    document.querySelector('#opacity-slider-1884').addEventListener('input', function (e) {
        var opacity = e.target.value;
        geoRasterLayer.setOpacity(opacity);
    });
    // opacity for 1964 layer : geoRasterLayer_2
    document.querySelector('#opacity-slider-1964').addEventListener('input', function (e) {
        var opacity = e.target.value;
        geoRasterLayer_2.setOpacity(opacity);
    });
    // opacity for Bing layer
    document.querySelector('#opacity-slider-bing').addEventListener('input', function (e) {
        var opacity = e.target.value;
        bingLayer.setOpacity(opacity);
    });
}

function filter_layer_id (layer_id) {
    for (let key in map._layers) {
     if (map._layers[key].options.layer_id == layer_id) {
         return map._layers[key]
        }
    }
}

function return_all_layer_id () {
    for (let key in map._layers) {
        if (map._layers[key].options.hasOwnProperty('layer_id')) {
            console.log(key,map._layers[key].options.layer_id);
        }
    }
}


loadGeoRaster();
