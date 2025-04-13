// base url for local/remote operaitions
const base_url = "https://kidpixo.github.io/leaflet-test/"
// const base_url = "http://0.0.0.0:8080/"

var map = L.map("map", {
    center: [41.355946, 14.370868],
    zoom: 17,
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
        minZoom: 2,
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


function getJSON(url, cb) {
  fetch(url)
    .then(response => response.json())
    .then(result => cb(result))
    .catch(error => console.error(error));
}

// grab the data : Photo origin points for markers
var url_origin = base_url+'photos_origin.geojson';

getJSON(url_origin, function(geojson_origin) {
  // Do something with the result
  // console.log(geojson_origin);
  photos_origin_layer = L.geoJSON(geojson_origin, {
      onEachFeature: function(feature, layer) {
        var text = feature.properties.text.replace(/['"]+/g, '');
        var filename = feature.properties.filename;
        // Create a popup with the text and image
        var popupContent_pre = '<div>' +
          '<h2>' + text + '</h2>' +
          '<a href="'+ base_url + 'photos/'+ filename + '"  target="_blank" rel="noopener noreferrer">original';

        if (filename.includes('.webm')) {
            var popupContent_show = '<video controls id="markers_popup_photos" src="'+ base_url + 'photos/thumbnail_'+ filename + '" alt="' + filename + '"></video>'
        } else {
            var popupContent_show = '<img id="markers_popup_photos" src="'+ base_url + 'photos/thumbnail_'+ filename + '" alt="' + filename + '">'
        }
          
         var popupContent_post = '</a>'+
          '</div>';

        var popupContent = popupContent_pre+popupContent_show+popupContent_post
        layer.bindPopup(popupContent,{maxWidth: "auto"});
      }
    }).addTo(map);
});

// grab the data : Photo field of view for polygons
var url_fov = base_url+'photos_fov.geojson';
var photos_fov_style = {
    "weight": 0,
    "fillOpacity": .3
};
getJSON(url_fov, function(geojson_fov) {
  // Do something with the result
  // console.log(geojson_fov);
  photos_fov_layer = L.geoJSON(geojson_fov, {style: photos_fov_style}).addTo(map);
});

/**
 * Adds a PNG layer to the map by reading its .aux.xml file for georeferencing.
 * @param {Object} map - The Leaflet map instance.
 * @param {string} pngPath - The path to the PNG file.
 * @returns {Promise<Object>} - The added Leaflet image overlay layer.
 */
async function addPngLayerFromAuxXml(map, pngPath) {
    // Helper function to parse the .aux.xml file and extract the extent
    async function getExtentFromAuxXml(auxXmlPath) {
        const response = await fetch(auxXmlPath);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        const geoTransform = xmlDoc.querySelector("GeoTransform").textContent.trim().split(",").map(Number);
        const [minX, pixelWidth, , maxY, , pixelHeight] = geoTransform;

        const width = parseFloat(xmlDoc.querySelector("PAMDataset > Metadata > MDI[key='INTERLEAVE']")?.textContent || 0);
        const height = parseFloat(xmlDoc.querySelector("PAMDataset > Metadata > MDI[key='AREA_OR_POINT']")?.textContent || 0);

        const maxX = minX + width * pixelWidth;
        const minY = maxY + height * pixelHeight;

        return [[minY, minX], [maxY, maxX]];
    }

    // Construct the path to the .aux.xml file
    const auxXmlPath = `${pngPath}.aux.xml`;

    // Extract the extent from the .aux.xml file
    const extent = await getExtentFromAuxXml(auxXmlPath);

    // Create and add the PNG layer to the map
    const pngLayer = L.imageOverlay(pngPath, extent, { opacity: 0.7 });
    pngLayer.addTo(map);

    return pngLayer;
}

// add png layer
// const pngLayer = await addPngLayerFromAuxXml(map, base_url+'Mappa_cut_modified.png');

async function loadGeoRaster() {
    // add first georaster
    var url_to_geotiff_file = base_url+"COG_1884_EPSG4326.tif";
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
    var url_to_geotiff_file_2 = base_url+"COG_1964_EPSG4326.tif";
    // var url_to_geotiff_file_2 = "http://0.0.0.0:44000/COG_1964_EPSG4326.tif";
    var georaster_2 = await parseGeoraster(url_to_geotiff_file_2, {'resampleMethod':'nearest'});

    geoRasterLayer_2 = new GeoRasterLayer({
        debugLevel: 0,
        georaster:georaster_2,
        resolution: 256,
        opacity: 0.7,
    }).addTo(map);
    geoRasterLayer_2.options['layer_id']='1964'

    // build layers group
    // basemaps
    var baseMaps = {
        "OpenStreetMap": tile_layer,
        // "Bing": bingLayer
    };
    // overlays, insert input range as title with ad-hoc IDs
    // // try to get the layer opacity
    // var bingLayer_id ='bing<input type="range" id="opacity-slider-bing" min="0" max="1" step="0.1" value="'
    // bingLayer_id = bingLayer_id.concat(String(filter_layer_id('bing').options.opacity), '" />')
    // console.log( bingLayer_id );
    var overlayMaps = {
        'bing<input type="range" id="opacity-slider-bing" min="0" max="1" step="0.1" value="0.4" />' : bingLayer,
        '1884<input type="range" id="opacity-slider-1884" min="0" max="1" step="0.1" value="0.7" />' : geoRasterLayer,
        '1964<input type="range" id="opacity-slider-1964" min="0" max="1" step="0.1" value="0.7" />' : geoRasterLayer_2,
        'foto'                                                                                       : photos_origin_layer,
    // 'foto fov'                                                                                       : photos_fov_layer,
    'foto fov<input type="range" id="opacity-slider-fov" min="0" max="1" step="0.1" value="0.3" />'  : photos_fov_layer,
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
    // opacity for photos_fov
    document.querySelector('#opacity-slider-fov').addEventListener('input', function (e) {
        var opacity = e.target.value;
        photos_fov_layer.setStyle(new_style(opacity));
    });
}

(function() {
    var control = new L.Control({ position: 'topleft' });
    control.onAdd = function(map) {
        var azoom = L.DomUtil.create('a', 'mt-0');
        azoom.innerHTML = '<div class="leaflet-control-zoom leaflet-bar leaflet-control mt-0 ms-0"><a class="leaflet-control-reset-zoom" title="Reset zoom" role="button" aria-label="Reset zoom">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">' +
            '<path fill-rule="evenodd" d="M2 13.5V7h1v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7h1v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5zm11-11V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"/>' +
            '<path fill-rule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/>' +
            '</svg></a></div>';
        L.DomEvent
            .disableClickPropagation(azoom)
            .addListener(azoom, 'click', function() {
                map.setView(map.options.center, map.options.zoom);
            }, azoom);
        return azoom;
    };
    control.addTo(map);
})();

// see [(2) Leaflet geoJSON - function within setStyle() : gis](https://www.reddit.com/r/gis/comments/ukyip9/leaflet_geojson_function_within_setstyle/)
const new_style = function(opacity) {
    return {
    "fillOpacity": opacity
    };
};

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


// loadGeoRaster();
(async () => {
    await loadGeoRaster();
})();
