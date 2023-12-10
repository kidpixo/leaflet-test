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

// Let's lay down the base map, the canvas where our map artwork will unfold
var tile_layer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "Mixed by Kidpixo",
        detectRetina: false,
        maxNativeZoom: 19,
        maxZoom: 19,
        minZoom: 0,
        noWrap: false,
        opacity: 1,
        subdomains: "abc",
        tms: false,
    }
);

// Drop it like it's hot on our map
tile_layer.addTo(map);

// Now, introducing the Bing Photo Layer - because regular maps are so last season
// P.S. Don't forget to insert your api key - https://www.bingmapsportal.com/
var bingLayer = new L.TileLayer.Bing('Ai2nLg63EqcX4-3ZTWHmKNQbUkcsnEYuVJGlD8V0GC83idoO0u8cu7AzD-UOz5KV', {
    type: 'AerialWithLabels', // You can change the type to 'AerialWithLabels' or 'Road'
    maxNativeZoom: 18,
    maxZoom: 19,
});

// Adding the Bing Photo Layer to our map
bingLayer.addTo(map);

var geoRasterLayer;

async function loadGeoRaster() {
    var url_to_geotiff_file = "https://kidpixo.github.io/leaflet-test/COG_EPSG4326.tif";
    var georaster = await parseGeoraster(url_to_geotiff_file);

    geoRasterLayer = new GeoRasterLayer({
        debugLevel: 0,
        georaster,
        resolution: 256,
        opacity: 0.75,
    }).addTo(map);

    var opacitySliderGeoRaster = L.control({ position: 'topright' });

    opacitySliderGeoRaster.onAdd = function () {
        var div = L.DomUtil.create('div', 'leaflet-control-opacity-slider');
        div.innerHTML = '<label for="opacity-slider-geo-raster">GeoRaster Opacity:</label><input type="range" id="opacity-slider-geo-raster" min="0" max="1" step="0.1" value="0.75" />';
        L.DomEvent.disableClickPropagation(div);

        var opacityInput = div.querySelector('#opacity-slider-geo-raster');
        opacityInput.addEventListener('input', function (e) {
            var opacity = e.target.value;
            geoRasterLayer.setOpacity(opacity);
        });

        return div;
    };

    opacitySliderGeoRaster.addTo(map);

    // Create an opacity slider for the Bing layer
    var opacitySliderBingLayer = L.control({ position: 'topright' });

    opacitySliderBingLayer.onAdd = function () {
        var div = L.DomUtil.create('div', 'leaflet-control-opacity-slider');
        div.innerHTML = '<label for="opacity-slider-bing-layer">Bing Opacity:</label><input type="range" id="opacity-slider-bing-layer" min="0" max="1" step="0.1" value="0.5" />';
        L.DomEvent.disableClickPropagation(div);

        div.querySelector('#opacity-slider-bing-layer').addEventListener('input', function (e) {
            var opacity = e.target.value;
            bingLayer.setOpacity(opacity);
        });

        return div;
    };

    opacitySliderBingLayer.addTo(map);
}

loadGeoRaster();
