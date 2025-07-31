// Constants and configuration for the map and layers
// automatic URL detection for local or production environment
const BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://0.0.0.0:44000/maps_data/"
  : "https://kidpixo.github.io/leaflet-test/maps_data/";

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
        attribution: 'Powered by [Esri](https://www.esri.com)',
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
        url: BASE_URL + "COG_1884.jpeg-band.tif",
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
        url: BASE_URL + "COG_1970.jpeg-band.tif",
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

    // Add right-click context menu to show coordinates in a popup
    layers.map.on("contextmenu", function (event) {
        L.popup()
            .setLatLng(event.latlng)
            .setContent("Coordinates:<br>" + event.latlng.lat.toFixed(6) + ", " + event.latlng.lng.toFixed(6))
            .openOn(layers.map);
    });
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

// Add PNG image overlay (underground map)
function addImageOverlays() {
    for (const key in LAYER_CONFIG) {
        const cfg = LAYER_CONFIG[key];
        if (!cfg.visible || cfg.layerType !== 'image') continue;
        try {
            layers[cfg.id] = L.imageOverlay(cfg.url, cfg.imageBounds, { opacity: cfg.opacity ?? 1 });
            layers[cfg.id].options['layer_id'] = cfg.id;
            layers[cfg.id].addTo(layers.map);
        } catch (error) {
            console.error(`Error adding image overlay for ${cfg.id}:`, error);
        }
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
        if (layers.layerControl) {
            layers.map.removeControl(layers.layerControl);
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
                el.addEventListener('input', debounce((e) => {
                    const opacity = e.target.value;
                    if (cfg.id === 'fov') {
                        layer.setStyle(new_style(opacity));
                    } else {
                        layer.setOpacity(opacity);
                    }
                }, 50));
            }
        }
    }, 700);
}

// Add a custom control (reset zoom button)
function setupCustomControls() {
    const control = new L.Control({ position: 'topleft' });
    control.onAdd = function(map) {
        const azoom = L.DomUtil.create('a', 'mt-0');
        azoom.innerHTML = `<div class="leaflet-control-zoom leaflet-bar leaflet-control mt-0 ms-0"><a class="leaflet-control-reset-zoom" title="Reset zoom" role="button" aria-label="Reset zoom">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M2 13.5V7h1v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7h1v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5zm11-11V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"/>
            <path fill-rule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/>
            </svg></a></div>`;
        L.DomEvent
            .disableClickPropagation(azoom)
            .on(azoom, 'click', () => {
                layers.map.setView(layers.map.options.center, layers.map.options.zoom);
            });
        return azoom;
    };
    control.addTo(layers.map);
}

// Add photo origin points as a GeoJSON layer
async function addPhotoLayers() {
    const promises = [];
    for (const key in LAYER_CONFIG) {
        const cfg = LAYER_CONFIG[key];
        if (!cfg.visible || cfg.layerType !== 'geojson') continue;
        const promise = new Promise((resolve, reject) => {
            getJSON(cfg.url, (geojson) => {
                try {
                    layers[cfg.id] = L.geoJSON(geojson, {
                        onEachFeature: (feature, layer) => {
                            const text = feature.properties.text.replace(/['"]+/g, '');
                            const filename = feature.properties.filename;
                            const popupContent = `<div><h2>${text}</h2><a href="${BASE_URL}photos/${filename}" target="_blank" rel="noopener noreferrer">original` +
                                (filename.includes('.webm')
                                    ? `<video controls id="markers_popup_photos" src="${BASE_URL}photos/thumbnail_${filename}" alt="${filename}"></video>`
                                    : `<img id="markers_popup_photos" src="${BASE_URL}photos/thumbnail_${filename}" alt="${filename}">`) +
                                '</a></div>';
                            layer.bindPopup(popupContent, {maxWidth: "auto"});
                        }
                    }).addTo(layers.map);
                    resolve();
                } catch (error) {
                    console.error(`Error adding photo layer for ${cfg.id}:`, error);
                    reject(error);
                }
            });
        });
        promises.push(promise);
    }
    return Promise.all(promises);
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
    sliderContainer.className = 'w-100 px-4 pb-2';
    sliderContainer.style.bottom = '60px'; // Move slider higher above credits (was '0')
    sliderContainer.style.left = '0';
    sliderContainer.style.zIndex = '1000';
    sliderContainer.style.pointerEvents = 'auto';
    sliderContainer.style.background = 'none';
    sliderContainer.style.textAlign = 'center';

    // Create year labels
    const labelRow = document.createElement('div');
    labelRow.className = 'd-flex justify-content-between mx-auto';
    labelRow.style.position = 'relative';
    labelRow.style.zIndex = '1001';
    labelRow.style.marginBottom = '4px';
    labelRow.style.width = '100%'; // Match slider width
    labelRow.style.maxWidth = '100%';
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

    // Create slider input
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'timeline-slider';
    slider.className = 'form-range'; // Bootstrap style
    slider.min = 0;
    slider.max = years.length - 1;
    slider.step = '0.01'; // Smooth fade
    slider.value = 0;
    slider.style.margin = '0 auto';
    slider.style.width = '100%'; // Match labelRow width
    sliderContainer.appendChild(slider);

    // Create play button
    const playBtn = document.createElement('button');
    playBtn.id = 'timeline-play-btn';
    playBtn.className = 'leaflet-control leaflet-bar';
    playBtn.innerHTML = '&#9654;'; // Unicode play symbol ▶
    playBtn.title = 'Play timeline';
    playBtn.style.fontSize = '1.5em';
    playBtn.style.verticalAlign = 'middle';
    playBtn.style.cursor = 'pointer';
    playBtn.style.marginRight = '16px';

    // Single/Loop switch
    const singleLoopLabel = document.createElement('label');
    singleLoopLabel.className = 'leaflet-control form-check form-switch mb-2';
    singleLoopLabel.style.display = 'flex';
    singleLoopLabel.style.alignItems = 'center';
    singleLoopLabel.style.fontSize = '1.25em';
    singleLoopLabel.style.color = '#222';
    singleLoopLabel.style.fontWeight = 'bold';
    singleLoopLabel.style.textShadow = '0 0 8px #fff, 0 0 2px #fff, 0 0 1px #fff';
    singleLoopLabel.style.marginRight = '16px';
    singleLoopLabel.innerHTML = `<input class="form-check-input" type="checkbox" id="timeline-switch-loop" checked> loop  `;
    
    // Slow/Fast switch
    const slowFastLabel = document.createElement('label');
    slowFastLabel.className = ' leaflet-control form-check form-switch';
    slowFastLabel.style.display = 'flex';
    slowFastLabel.style.alignItems = 'center';
    slowFastLabel.style.fontSize = '1.25em';
    slowFastLabel.style.color = '#222';
    slowFastLabel.style.fontWeight = 'bold';
    slowFastLabel.style.textShadow = '0 0 8px #fff, 0 0 2px #fff, 0 0 1px #fff';
    slowFastLabel.innerHTML = `<input class="form-check-input" type="checkbox" id="timeline-switch-speed"> fast `;

    // Reverse switch
    const reverseLabel = document.createElement('label');
    reverseLabel.className = 'leaflet-control form-check form-switch';
    reverseLabel.style.display = 'flex';
    reverseLabel.style.alignItems = 'center';
    reverseLabel.style.fontSize = '1.25em';
    reverseLabel.style.color = '#222';
    reverseLabel.style.fontWeight = 'bold';
    reverseLabel.style.textShadow = '0 0 8px #fff, 0 0 2px #fff, 0 0 1px #fff';
    reverseLabel.innerHTML = `<input class="form-check-input" type="checkbox" id="timeline-switch-reverse"> rev`;

    // Controls row: play button and switches in a row below the slider
    const controlsRow = document.createElement('div');
    controlsRow.style.display = 'flex';
    controlsRow.style.flexDirection = 'row';
    controlsRow.style.justifyContent = 'center';
    controlsRow.style.alignItems = 'center';
    controlsRow.style.width = '60%';
    controlsRow.style.margin = '8px auto 0 auto';

    controlsRow.appendChild(playBtn);
    controlsRow.appendChild(singleLoopLabel);
    controlsRow.appendChild(slowFastLabel);
    controlsRow.appendChild(reverseLabel);
    sliderContainer.appendChild(controlsRow);
    document.body.appendChild(sliderContainer);

    // --- Collapsible Leaflet Control Wrapper ---
    const collapsibleControl = document.createElement('div');
    collapsibleControl.className = 'leaflet-control leaflet-bar';
    collapsibleControl.style.position = 'absolute';
    collapsibleControl.style.left = '50%';
    // collapsibleControl.style.transform = 'translateX(-50%)';
    collapsibleControl.style.bottom = '60px';
    collapsibleControl.style.textAlign = 'center';
    collapsibleControl.style.pointerEvents = 'auto';
    collapsibleControl.style.width = '95vw'; // 95% of viewport width
    collapsibleControl.style.maxWidth = '';
    collapsibleControl.style.minWidth = '';
    collapsibleControl.style.border = '1px solid #bbb';
    collapsibleControl.style.borderRadius = '8px';
    collapsibleControl.style.background = 'rgba(255,255,255,0.3)';
    collapsibleControl.style.display = 'flex';
    collapsibleControl.style.flexDirection = 'row';
    collapsibleControl.style.alignItems = 'stretch';
    // Place the control at the bottom center
    collapsibleControl.style.transform = 'translateX(-50%)';
    collapsibleControl.style.zIndex = '1003';

 
    sliderContainer.style.width = '100%';
    sliderContainer.style.display = 'flex';
    sliderContainer.style.flexDirection = 'column';
    sliderContainer.style.justifyContent = 'center';
    sliderContainer.style.alignItems = 'center';
    sliderContainer.style.background = 'none';
    sliderContainer.style.borderRadius = '8px';

    // Toggle button (collapse)
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'leaflet-bar leaflet-control'; // Use Leaflet's button style
    toggleBtn.style.border = '';
    toggleBtn.style.background = '';
    toggleBtn.style.fontWeight = 'bold';
    // toggleBtn.style.fontSize = '1.5em';
    toggleBtn.style.cursor = 'pointer';
    // toggleBtn.style.padding = '8px 16px';
    toggleBtn.style.height = '100%';
    toggleBtn.style.display = 'flex';
    toggleBtn.style.alignItems = 'center';
    toggleBtn.style.justifyContent = 'center';
    toggleBtn.innerHTML = '&#8942;'; // ⋮ vertical dots for expanded

    // Place button to left
    collapsibleControl.appendChild(toggleBtn);
    collapsibleControl.appendChild(sliderContainer);

    // Hide sliderContainer initially
    sliderContainer.style.display = '';

    // Toggle logic
    let collapsed = false;
    toggleBtn.addEventListener('click', function() {
        collapsed = !collapsed;
        if (collapsed) {
            sliderContainer.style.display = 'none';
            collapsibleControl.style.width = 'auto';
            collapsibleControl.style.left = '20px'; // Collapse to left side
            collapsibleControl.style.right = '';
            collapsibleControl.style.transform = '';
            collapsibleControl.style.justifyContent = 'flex-start';
        } else {
            sliderContainer.style.display = 'flex';
            collapsibleControl.style.width = '95vw';
            collapsibleControl.style.left = '50%';
            collapsibleControl.style.right = '';
            collapsibleControl.style.transform = 'translateX(-50%)';
            collapsibleControl.style.justifyContent = '';
        }
        toggleBtn.innerHTML = collapsed ? '&#9776;' : '&#8942;'; // ☰ for collapsed, ⋮ for expanded
    });

   document.body.appendChild(collapsibleControl);

    // Handler for slider movement (timeline slider)
    slider.addEventListener('input', debounce(function(e) {
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
    }, 50));

    // --- PLAY LOGIC ---
    let playing = false;
    let playInterval = null;
    let currentStep = 0;
    const stepsPerLabel = 20; // smoothness between labels
    const totalSteps = (years.length - 1) * stepsPerLabel;
    const baseStepTime = 3000 / stepsPerLabel; // 1s per label
    const fastStepTime = baseStepTime / 4; // 4x speed

    function getDirection() {
        return reverseLabel.querySelector('input').checked ? -1 : 1;
    }
    function getLoop() {
        return singleLoopLabel.querySelector('input').checked;
    }
    function getSpeed() {
        return slowFastLabel.querySelector('input').checked ? fastStepTime : baseStepTime;
    }
    function setPlaying(state) {
        playing = state;
        playBtn.innerHTML = state ? '&#9632;' : '&#9654;'; // ■ for stop, ▶ for play
    }
    function playTimeline() {
        console.log('playTimeline called'); // Debug log
        if (playing) return;
        setPlaying(true);
        let direction = getDirection();
        let loop = getLoop();
        let speed = getSpeed();
        let min = 0, max = totalSteps;
        let val = Math.round(parseFloat(slider.value) * stepsPerLabel);
        currentStep = val;
        function step() {
            // console.log('step called, playing:', playing); // Debug log
            direction = getDirection();
            loop = getLoop();
            speed = getSpeed();
            // Clamp currentStep before increment
            if (currentStep < min) currentStep = min;
            if (currentStep > max) currentStep = max;
            // console.log('currentStep:', currentStep, 'min:', min, 'max:', max); // Debug log
            slider.value = (currentStep / stepsPerLabel).toFixed(2);
            // console.log('playTimeline step, slider.value:', slider.value); // Debug log
            slider.dispatchEvent(new Event('input'));
            currentStep += direction;
            // Now check bounds after increment
            if (currentStep < min || currentStep > max) {
                // console.log('Out of bounds, stopping or looping'); // Debug log
                if (loop) {
                    currentStep = direction === -1 ? max : min;
                } else {
                    stopTimeline();
                    return;
                }
            }
            playInterval = setTimeout(step, speed);
        }
        playInterval = setTimeout(step, speed);
    }
    function stopTimeline() {
        setPlaying(false);
        if (playInterval) clearTimeout(playInterval);
        playInterval = null;
    }
    playBtn.addEventListener('click', function() {
        if (playing) {
            stopTimeline();
        } else {
            playTimeline();
        }
    });
    // If any switch changes, update speed/direction immediately
    [singleLoopLabel, slowFastLabel, reverseLabel].forEach(label => {
        label.querySelector('input').addEventListener('change', () => {
            if (playing) {
                stopTimeline();
                playTimeline();
            }
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

// Utility: debounce function for performance
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

// Utility: fetch JSON data from a URL
const getJSON = (url, cb) => {
    fetch(url)
        .then(response => response.json())
        .then(result => cb(result))
        .catch(error => console.error(error));
}

// Utility: return a style object with custom fill opacity
const new_style = (opacity) => ({ "fillOpacity": opacity });

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
