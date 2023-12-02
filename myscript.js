// Without any import, parseGeoraster and GeoRasterLayer are not defined.
//
// // if I use this error : Uncaught SyntaxError: import declarations may only appear at top level of a module
// import { parse_georaster } from "georaster.bundle.min.js";
// import { GeoRasterLayer } from "georaster-layer-for-leaflet.js";

// // this works only for NPM I believe???  
// var parse_georaster = require("georaster");
// var GeoRasterLayer  = require("georaster-layer-for-leaflet");


// create the map with leaflets : this works 
var map_8b18675d1207ba7ec9b46561683fae53 = L.map(
    "map_8b18675d1207ba7ec9b46561683fae53",
    {
        center: [41.355946, 14.370868],
        crs: L.CRS.EPSG3857,
        zoom: 17,
        zoomControl: true,
        preferCanvas: false,
    }
);

// add the layer to the map object
var tile_layer_8f7a0b775b1d116030f3be04b513e763 = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {"attribution": "Data by Peppe.",
     "detectRetina": false,
     "maxNativeZoom": 18,
     "maxZoom": 18,
     "minZoom": 0,
     "noWrap": false,
     "opacity": 1,
     "subdomains": "abc",
     "tms": false}
        );

tile_layer_8f7a0b775b1d116030f3be04b513e763.addTo(map_8b18675d1207ba7ec9b46561683fae53);

//////////////////////////////////////////////////////////////////
// add a GeoRasterLayer : not working
var url_to_geotiff_file = "http://0.0.0.0:44000/COG_4326.tif";
      parseGeoraster(url_to_geotiff_file).then(function (georaster) {
        console.log("georaster:", georaster);
        const layer = new GeoRasterLayer({
          debugLevel: 0,
          georaster,
          resolution: 512
        });
        layer.addTo(map_8b18675d1207ba7ec9b46561683fae53);
      });
  // parse_georaster(url_to_geotiff_file).then(function (georaster) {
  //   const { noDataValue } = georaster;
  //   var pixelValuesToColorFn = function (values) {
  //     if (
  //       values.some(function (value) {
  //         return value === noDataValue;
  //       })
  //     ) {
  //       return "rgba(0,0,0,0.0)";
  //     } else {
  //       const [r, g, b] = values;
  //       return `rgba(${r},${g},${b},.85)`;
  //     }
  //   };
  //   const resolution = 64;
  //   var layer = new GeoRasterLayer({
  //     debugLevel: 4,
  //     attribution: "Planet",
  //     georaster: georaster,
  //     pixelValuesToColorFn: pixelValuesToColorFn,
  //     resolution: resolution
  //   });
  //   layer.addTo(map_8b18675d1207ba7ec9b46561683fae53);
  //
  //   setTimeout(() => {
  //     map_8b18675d1207ba7ec9b46561683fae53.flyToBounds(layer.getBounds());
  //   }, 1000);
  // });
//////////////////////////////////////////////////////////////////

// add the layers to the controls 
var layer_control_fc1b6c5d49c008275fba3cde6f4d87fe_layers = {
    base_layers : {
        "openstreetmap" : tile_layer_8f7a0b775b1d116030f3be04b513e763,
    },
    overlays :  {
        // "layer" : layer, // this should be the layer loaded via GeoRasterLayer
    },
};
let layer_control_fc1b6c5d49c008275fba3cde6f4d87fe = L.control.layers(
    layer_control_fc1b6c5d49c008275fba3cde6f4d87fe_layers.base_layers,
    layer_control_fc1b6c5d49c008275fba3cde6f4d87fe_layers.overlays,
    {"autoZIndex": true, "collapsed": false, "position": "topright"}
).addTo(map_8b18675d1207ba7ec9b46561683fae53);
new L.Draggable(layer_control_fc1b6c5d49c008275fba3cde6f4d87fe.getContainer()).enable();
