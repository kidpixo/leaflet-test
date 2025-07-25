// Constants and configuration for the map and layers
// automatic URL detection for local or production environment
const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "0.0.0.0"
  ? "http://0.0.0.0:44000/"
  : "https://kidpixo.github.io/leaflet-test/";

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
        layerType: "tile",
        showInControl: false
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
        opacity: 1.0,
        slider: true,
        visible: true,
        layerType: "tile",
        showInControl: true
    },
    RASTER_1884: {
        id: "1884",
        type: "overlay",
        name: "1884",
        year: "1884",
        url: BASE_URL + "COG_1884.tif",
        opacity: 0.7,
        slider: true,
        visible: true,
        layerType: "georaster",
        extraOptions: { resolution: 256 },
        showInControl: true
    },
    RASTER_1940: {
        id: "1940",
        type: "overlay",
        name: "1940",
        year: "1940",
        url: BASE_URL + "COG_1940.tif",
        opacity: 0.7,
        slider: true,
        visible: true,
        layerType: "georaster",
        extraOptions: { resolution: 256},
        showInControl: true,
        grayscale: true
    },
    RASTER_1964: {
        id: "1964",
        type: "overlay",
        name: "1964",
        year: "1964",
        url: BASE_URL + "COG_1964.tif",
        opacity: 0.7,
        slider: true,
        visible: true,
        layerType: "georaster",
        extraOptions: { resolution: 256},
        showInControl: true
    },
       RASTER_1970: {
        id: "1970",
        type: "overlay",
        name: "1970",
        year: "1970",
        url: BASE_URL + "COG_1970.tif",
        opacity: 0.7,
        slider: true,
        visible: true,
        layerType: "georaster",
        extraOptions: { resolution: 256},
        showInControl: true,
        grayscale: true
    },
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
        ],
        showInControl: true
    },
    FOTO: {
        id: "foto",
        type: "overlay",
        name: "foto",
        url: BASE_URL + 'photos_origin.geojson',
        slider: false,
        visible: true,
        layerType: "geojson",
        showInControl: true
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
    await addPhotoLayers(); // Add photo origin points as GeoJSON (now awaited)
    addImageOverlays(); // Add PNG image overlay (underground)
    addLayerControls(); // Add layer switcher and overlay controls
    setupOpacityControls(); // Add opacity sliders for layers
    setupCustomControls(); // Add custom controls (e.g., reset zoom)
}

// --- URL PARAMS HANDLING ---
(function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    // Layers and opacity: ?layers=1884:0.5,1964:0.8,1940
    const layersParam = params.get('layers');
    if (layersParam) {
        // Hide all overlays by default
        for (const key in LAYER_CONFIG) {
            if (LAYER_CONFIG[key].type === 'overlay') {
                LAYER_CONFIG[key].visible = false;
            }
        }
        // Show only those in the URL
        layersParam.split(',').forEach(entry => {
            let [name, opacity] = entry.split(':');
            // Find by name (case-insensitive)
            for (const key in LAYER_CONFIG) {
                if (LAYER_CONFIG[key].name.toLowerCase() === name.toLowerCase()) {
                    LAYER_CONFIG[key].visible = true;
                    if (opacity !== undefined && !isNaN(parseFloat(opacity))) {
                        LAYER_CONFIG[key].opacity = parseFloat(opacity);
                    }
                }
            }
        });
    }
    // Center: ?center=lat,lng
    const centerParam = params.get('center');
    if (centerParam) {
        const [lat, lng] = centerParam.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
            window._mapCenterOverride = [lat, lng];
        }
    }
    // Zoom: ?zoom=18
    const zoomParam = params.get('zoom');
    if (zoomParam && !isNaN(parseInt(zoomParam))) {
        window._mapZoomOverride = parseInt(zoomParam);
    }
})();

// Create the Leaflet map and add geolocation control
function createMap() {
    layers.map = L.map("map", {
        center: window._mapCenterOverride || [41.35512154669242, 14.372210047410501], // Initial map center
        zoom: window._mapZoomOverride || 17, // Initial zoom level
        maxZoom: 20, // or another value depending on your data
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
                maxZoom: layers.map.options.maxZoom,
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
                        maxZoom: layers.map.options.maxZoom,
                        ...cfg.extraOptions
                    }).addTo(layers.map);
                    layers[cfg.id].setOpacity(cfg.opacity ?? 1);
                    layers[cfg.id].options['layer_id'] = cfg.id;
                }
            } else {
                layers[cfg.id] = L.tileLayer(cfg.url, {
                    attribution: cfg.attribution,
                    opacity: cfg.opacity ?? 1,
                    maxZoom: layers.map.options.maxZoom,
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
        let options = {
            debugLevel: 0,
            georaster: georaster,
            opacity: cfg.opacity ?? 1,
            ...cfg.extraOptions
        };
        if (cfg.grayscale) {
            options.pixelValuesToColorFn = values => {
                const v = values[0];
                if (v === 0 || v === undefined) return null;
                return `rgb(${v},${v},${v})`;
            };
        }
        layers[cfg.id] = new GeoRasterLayer(options).addTo(layers.map);
        layers[cfg.id].options['layer_id'] = cfg.id;
    }
}

// Add photo origin points as a GeoJSON layer
function addPhotoLayers() {
    const promises = [];
    for (const key in LAYER_CONFIG) {
        const cfg = LAYER_CONFIG[key];
        if (!cfg.visible || cfg.layerType !== 'geojson') continue;
        const promise = new Promise((resolve, reject) => {
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
                resolve();
            });
        });
        promises.push(promise);
    }
    return Promise.all(promises);
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
        let baseMaps = {};
        let overlayMaps = {};
        for (const key in LAYER_CONFIG) {
            const cfg = LAYER_CONFIG[key];
            const layer = layers[cfg.id];
            if (!layer) continue;
            if (cfg.showInControl === false) continue; // skip if not to be shown
            if (cfg.type === 'basemap') {
                baseMaps[cfg.name] = layer;
            } else if (cfg.type === 'overlay') {
                if (cfg.slider) {
                    overlayMaps[`${cfg.name}<input type=\"range\" id=\"opacity-slider-${cfg.id}\" class=\"opacity-slider\" min=\"0\" max=\"1\" step=\"0.1\" value=\"${cfg.opacity ?? 1}\" />`] = layer;
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

// --- Timeline Slider ---
function createTimelineSlider() {
    // Only use overlays that are currently visible and have a year
    const years = Object.values(LAYER_CONFIG)
        .filter(cfg => cfg.type === 'overlay' && cfg.year && cfg.visible)
        .map(cfg => parseInt(cfg.year))
        .filter(y => !isNaN(y))
        .sort((a, b) => a - b);
    if (years.length < 2) return; // Need at least 2 visible layers with year

    // Create slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.id = 'timeline-slider-container';
    sliderContainer.className = 'position-absolute w-100 px-4 pb-2';
    sliderContainer.style.bottom = '60px'; // Move slider higher above credits (was '0')
    sliderContainer.style.left = '0';
    sliderContainer.style.zIndex = '1000';
    sliderContainer.style.pointerEvents = 'auto';
    sliderContainer.style.background = 'none';
    sliderContainer.style.textAlign = 'center';

    // Create slider input
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'timeline-slider';
    slider.className = 'form-range'; // Bootstrap style
    slider.min = 0;
    slider.max = years.length - 1;
    slider.step = '0.01'; // Smooth fade
    slider.value = 0;
    slider.style.width = '60%';
    slider.style.margin = '0 auto';

    // Create year labels
    const labelRow = document.createElement('div');
    labelRow.className = 'd-flex justify-content-between w-60 mx-auto';
    labelRow.style.width = '60%';
    labelRow.style.position = 'relative';
    labelRow.style.zIndex = '1001';
    years.forEach((year, i) => {
        const lbl = document.createElement('span');
        lbl.innerText = year;
        lbl.style.fontSize = '1.25em';
        lbl.style.color = '#222';
        lbl.style.fontWeight = 'bold';
        lbl.style.textShadow = '0 0 8px #fff, 0 0 2px #fff, 0 0 1px #fff'; // White outer glow for readability
        lbl.style.padding = '2px 6px';
        lbl.style.borderRadius = '4px';
        labelRow.appendChild(lbl);
    });

    sliderContainer.appendChild(labelRow);
    sliderContainer.appendChild(slider);
    document.body.appendChild(sliderContainer);

    // Handler for slider movement
    slider.addEventListener('input', function(e) {
        const val = parseFloat(e.target.value);
        // Find nearest years
        const i = Math.floor(val);
        const frac = val - i;
        years.forEach((year, idx) => {
            // Find layer for this year
            const layerKey = Object.keys(LAYER_CONFIG).find(k => LAYER_CONFIG[k].year && parseInt(LAYER_CONFIG[k].year) === year);
            if (!layerKey) return;
            const layerObj = layers[LAYER_CONFIG[layerKey].id];
            if (!layerObj) return;
            let opacity = 0;
            if (idx === i) {
                opacity = 1 - frac;
            } else if (idx === i + 1) {
                opacity = frac;
            }
            // Set layer opacity
            layerObj.setOpacity(opacity);
            LAYER_CONFIG[layerKey].opacity = opacity;
            // Sync opacity slider in control
            const sliderEl = document.querySelector(`#opacity-slider-${LAYER_CONFIG[layerKey].id}`);
            if (sliderEl) sliderEl.value = opacity;
            // Ensure layer is visible in control
            const checkbox = document.querySelector(`input.leaflet-control-layers-selector[type='checkbox'][data-layerid='${LAYER_CONFIG[layerKey].id}']`);
            if (checkbox && !checkbox.checked) checkbox.checked = true;
        });
    });
}

// Patch: add data-layerid to checkboxes after layer control is created
function patchLayerControlCheckboxes() {
    setTimeout(() => {
        const selectors = document.querySelectorAll('.leaflet-control-layers-selector[type="checkbox"]');
        selectors.forEach(cb => {
            const label = cb.parentElement.textContent;
            for (const key in LAYER_CONFIG) {
                if (label.includes(LAYER_CONFIG[key].name)) {
                    cb.setAttribute('data-layerid', LAYER_CONFIG[key].id);
                }
            }
        });
    }, 1000);
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
    patchLayerControlCheckboxes();
    createTimelineSlider();
})();
