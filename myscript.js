// Constants and configuration for the map and layers
const BASE_URL = "https://kidpixo.github.io/leaflet-test/";
// const BASE_URL = "http://0.0.0.0:44000/";

// Layer configuration: defines all options for each layer
const LAYER_CONFIG = {
    OSM: {
        id: "osm",
        type: "basemap",
        name: "OpenStreetMap",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "Mixed by Kidpixo",
        opacity: 1,
        visible: true,
        layerType: "tile"
    },
    // BING: {
    //     id: "bing",
    //     type: "overlay",
    //     name: "Bing",
    //     url: "BING_API_KEY_HERE", // Replace with your Bing API key or comment out to disable
    //     opacity: 0.4,
    //     slider: true,
    //     visible: true,
    //     layerType: "bing"
    // },
    ESRI: {
        id: "esri",
        type: "overlay",
        name: "Esri",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        opacity: 0.8,
        slider: true,
        visible: true,
        layerType: "tile"
    },
    RASTER_1884: {
        id: "1884",
        type: "overlay",
        name: "1884",
        url: BASE_URL + "COG_1884.tif",
        opacity: 0.7,
        slider: true,
        visible: true,
        layerType: "georaster",
        extraOptions: { resolution: 256 }
    },
    RASTER_1964: {
        id: "1964",
        type: "overlay",
        name: "1964",
        url: BASE_URL + "COG_1964.tif",
        // url: BASE_URL + "COG_1964_EPSG3857.jpeg.cog",
        opacity: 0.7,
        slider: true,
        visible: true,
        layerType: "georaster",
        extraOptions: { resolution: 256}
    },
    // RASTER_1940 {
    //     id: "1940",
    //     type: "overlay",
    //     name: "1940",
    //     url: BASE_URL + "COG_1940.tif",
    //     opacity: 0.7,
    //     slider: true,
    //     visible: true,
    //     layerType: "georaster",
    //     extraOptions: { resolution: 256}
    // },
    SOTTERRANEO: {
        id: "sotterraneo",
        type: "overlay",
        name: "sotterraneo",
        url: BASE_URL + 'Mappa_cut_modified.png',
        opacity: 0.8,
        slider: true,
        visible: true,
        layerType: "image",
        imageBounds: [
            [41.35386391721536, 14.371526891622073],
            [41.354430965215357, 14.371859023622073]
        ]
    },
    FOTO: {
        id: "foto",
        type: "overlay",
        name: "foto",
        url: BASE_URL + 'photos_origin.geojson',
        slider: false,
        visible: true,
        layerType: "geojson"
    }
    // Add more as needed, or comment out to disable
};

// Global object to store all map layers for easy access
let layers = {};

// Main initialization function: sets up the map and all layers/controls
async function initMap() {
    createMap(); // Create the Leaflet map instance
    addBasemaps(); // Add base map layers (OSM, Bing, Esri)
    await addRasterLayers(); // Wait for rasters to load
    addPhotoLayers(); // Add photo origin points as GeoJSON
    addImageOverlays(); // Add PNG image overlay (underground)
    addLayerControls(); // Add layer switcher and overlay controls
    setupOpacityControls(); // Add opacity sliders for layers
    setupCustomControls(); // Add custom controls (e.g., reset zoom)
}

// Create the Leaflet map and add geolocation control
function createMap() {
    layers.map = L.map("map", {
        center: [41.355946, 14.370868], // Initial map center
        zoom: 17, // Initial zoom level
        zoomControl: true,
        preferCanvas: false,
    });
    L.control.locate().addTo(layers.map); // Add geolocate user button
}

// Add base map layers: OSM, Bing, Esri
function addBasemaps() {
    for (const key in LAYER_CONFIG) {
        const cfg = LAYER_CONFIG[key];
        if (!cfg.visible || cfg.type !== 'basemap') continue;
        if (cfg.layerType === 'tile') {
            layers[cfg.id] = L.tileLayer(cfg.url, {
                attribution: cfg.attribution,
                opacity: cfg.opacity ?? 1,
                ...cfg.extraOptions
            }).addTo(layers.map);
            layers[cfg.id].options['layer_id'] = cfg.id;
        }
        // Add more basemap types as needed
    }
    // Add overlays that are actually basemap-like (e.g. Bing, Esri) as overlays but not as basemaps
    for (const key in LAYER_CONFIG) {
        const cfg = LAYER_CONFIG[key];
        if (!cfg.visible || cfg.type !== 'overlay') continue;
        if (cfg.layerType === 'tile' || cfg.layerType === 'bing') {
            if (cfg.layerType === 'bing') {
                if (typeof L.TileLayer.Bing !== 'undefined') {
                    layers[cfg.id] = new L.TileLayer.Bing(cfg.url, {
                        type: 'AerialWithLabels',
                        opacity: cfg.opacity ?? 1,
                        ...cfg.extraOptions
                    }).addTo(layers.map);
                    layers[cfg.id].setOpacity(cfg.opacity ?? 1);
                    layers[cfg.id].options['layer_id'] = cfg.id;
                }
            } else {
                layers[cfg.id] = L.tileLayer(cfg.url, {
                    attribution: cfg.attribution,
                    opacity: cfg.opacity ?? 1,
                    ...cfg.extraOptions
                }).addTo(layers.map);
                layers[cfg.id].options['layer_id'] = cfg.id;
            }
        }
    }
}

async function addRasterLayers() {
    for (const key in LAYER_CONFIG) {
        const cfg = LAYER_CONFIG[key];
        if (!cfg.visible || cfg.layerType !== 'georaster') continue;
        const georaster = await parseGeoraster(cfg.url, {'resampleMethod':'nearest'});
        layers[cfg.id] = new GeoRasterLayer({
            debugLevel: 0,
            georaster: georaster,
            opacity: cfg.opacity ?? 1,
            ...cfg.extraOptions
        }).addTo(layers.map);
        layers[cfg.id].options['layer_id'] = cfg.id;
    }
}

// Add photo origin points as a GeoJSON layer
function addPhotoLayers() {
    for (const key in LAYER_CONFIG) {
        const cfg = LAYER_CONFIG[key];
        if (!cfg.visible || cfg.layerType !== 'geojson') continue;
        getJSON(cfg.url, function(geojson) {
            layers[cfg.id] = L.geoJSON(geojson, {
                onEachFeature: function(feature, layer) {
                    var text = feature.properties.text.replace(/['"]+/g, '');
                    var filename = feature.properties.filename;
                    var popupContent_pre = '<div>' +
                        '<h2>' + text + '</h2>' +
                        '<a href="'+ BASE_URL + 'photos/'+ filename + '"  target="_blank" rel="noopener noreferrer">original';
                    var popupContent_show = filename.includes('.webm') ?
                        '<video controls id="markers_popup_photos" src="'+ BASE_URL + 'photos/thumbnail_'+ filename + '" alt="' + filename + '"></video>' :
                        '<img id="markers_popup_photos" src="'+ BASE_URL + 'photos/thumbnail_'+ filename + '" alt="' + filename + '">';
                    var popupContent_post = '</a></div>';
                    var popupContent = popupContent_pre + popupContent_show + popupContent_post;
                    layer.bindPopup(popupContent, {maxWidth: "auto"});
                }
            }).addTo(layers.map);
        });
    }
}

// Add PNG image overlay (underground map)
function addImageOverlays() {
    for (const key in LAYER_CONFIG) {
        const cfg = LAYER_CONFIG[key];
        if (!cfg.visible || cfg.layerType !== 'image') continue;
        layers[cfg.id] = L.imageOverlay(cfg.url, cfg.imageBounds, { opacity: cfg.opacity ?? 1 });
        layers[cfg.id].options['layer_id'] = cfg.id;
        layers[cfg.id].addTo(layers.map);
    }
}

// Add layer switcher and overlay controls
function addLayerControls() {
    setTimeout(() => {
        // Build baseMaps and overlayMaps dynamically from LAYER_CONFIG
        let baseMaps = {};
        let overlayMaps = {};
        for (const key in LAYER_CONFIG) {
            const cfg = LAYER_CONFIG[key];
            const layer = layers[cfg.id];
            if (!layer) continue;
            if (cfg.type === 'basemap') {
                baseMaps[cfg.name] = layer;
            } else if (cfg.type === 'overlay') {
                if (cfg.slider) {
                    overlayMaps[`${cfg.name}<input type=\"range\" id=\"opacity-slider-${cfg.id}\" min=\"0\" max=\"1\" step=\"0.1\" value=\"${cfg.opacity ?? 1}\" />`] = layer;
                } else {
                    overlayMaps[cfg.name] = layer;
                }
            }
        }
        layers.layerControl = L.control.layers(baseMaps, overlayMaps, {"autoZIndex": true, "collapsed": false, "position": "topright"}).addTo(layers.map);
    }, 500);
}

// Add event listeners for opacity sliders for each layer
function setupOpacityControls() {
    setTimeout(() => {
        for (const key in LAYER_CONFIG) {
            const cfg = LAYER_CONFIG[key];
            if (!cfg.slider) continue;
            const el = document.querySelector(`#opacity-slider-${cfg.id}`);
            const layer = layers[cfg.id];
            if (el && layer) {
                el.addEventListener('input', function(e) {
                    var opacity = e.target.value;
                    if (cfg.id === 'fov') {
                        layer.setStyle(new_style(opacity));
                    } else {
                        layer.setOpacity(opacity);
                    }
                });
            }
        }
    }, 700);
}

// Add a custom control (reset zoom button)
function setupCustomControls() {
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
                layers.map.setView(layers.map.options.center, layers.map.options.zoom);
            }, azoom);
        return azoom;
    };
    control.addTo(layers.map);
}

// Utility: fetch JSON data from a URL
function getJSON(url, cb) {
    fetch(url)
        .then(response => response.json())
        .then(result => cb(result))
        .catch(error => console.error(error));
}

// Utility: return a style object with custom fill opacity
const new_style = function(opacity) {
    return { "fillOpacity": opacity };
};

// Utility: find a layer by its custom layer_id
function filter_layer_id(layer_id) {
    for (let key in layers.map._layers) {
        if (layers.map._layers[key].options.layer_id == layer_id) {
            return layers.map._layers[key];
        }
    }
}

// Utility: log all layer IDs in the map (for debugging)
function return_all_layer_id() {
    for (let key in layers.map._layers) {
        if (layers.map._layers[key].options.hasOwnProperty('layer_id')) {
            console.log(key, layers.map._layers[key].options.layer_id);
        }
    }
}

// Start everything: initialize map and add raster layers (async)
(async () => {
    await initMap();
})();
