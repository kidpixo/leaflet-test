# Leaflet Test: Cloud-Optimized GeoTIFFs and Interactive Historical Maps

## Problem-First Approach

### The Problem
Modern web mapping often requires overlaying large, high-resolution historical maps and geospatial data (like COG/GeoTIFF) on top of interactive base maps. Developers need a way to:
- Efficiently serve and visualize large raster datasets (COG/GeoTIFF) in the browser.
- Provide a user-friendly, interactive map with custom overlays, opacity controls, and dynamic configuration.
- Allow end-users to customize the map view (layers, opacity, center, zoom) via URL parameters for sharing and reproducibility.

### The Solution
This project combines Leaflet.js, georaster-layer-for-leaflet, and custom JavaScript to deliver a highly interactive, configurable map experience. It supports:
- Cloud-Optimized GeoTIFF (COG) overlays
- Dynamic layer control and opacity sliders
- GeoJSON photo markers with popups
- User geolocation
- URL-driven map configuration

---

## Story-Code-Context Pattern

### Story (Why)
- **Purpose:** Visualize and explore historical maps and photos of Piedimonte, overlaying COG rasters and interactive data on modern basemaps.
- **Motivation:** Make large, archival geospatial data accessible and explorable for historians, researchers, and the public.
- **Design Choices:**
  - Use COGs for efficient, partial loading of large rasters.
  - Use Leaflet for a familiar, extensible map UI.
  - Expose all configuration (layers, opacity, center, zoom) via URL for easy sharing and reproducibility.

### Code (How)

#### Quick Start
```sh
# Start a local server with Range support (for COGs)
pip install RangeHTTPServer
python -m RangeHTTPServer 44000
# Or, for CORS support:
python rangeserver.py
```

#### Example Usage
Open in browser:
```
http://localhost:44000/map.html?layers=1884:0.5,1964:0.8,1940&center=41.355,14.371&zoom=18
```
- Shows only the 1884, 1964, and 1940 overlays, with custom opacity and map view.

#### Layer Configuration Example (myscript.js)
```js
const LAYER_CONFIG = {
  RASTER_1884: {
    id: "1884",
    name: "1884",
    url: BASE_URL + "COG_1884.tif",
    opacity: 0.7,
    visible: true,
    layerType: "georaster",
    // ...
  },
  // ...
};
```

#### URL Parameter API
- `?layers=1884:0.5,1964:0.8,1940` — show only these overlays, with optional opacity
- `?center=41.355,14.371` — set map center
- `?zoom=18` — set map zoom

### Context (Where/When)
- Use this project when you need to visualize large geospatial rasters (COG/GeoTIFF) interactively in the browser.
- Integrates with any static or Python HTTP server supporting Range requests.
- Easily extendable: add new layers, markers, or controls by editing `LAYER_CONFIG` and `myscript.js`.
- URL-driven configuration is ideal for sharing specific map views or embedding in other web apps.

---

## Project Structure

- `map.html` — Main HTML entry point, includes all CSS/JS dependencies and the map container.
- `myscript.js` — Core logic for map creation, layer management, URL parsing, and UI controls.
- `LAYER_CONFIG` — Centralized configuration for all map layers (basemaps, overlays, images, geojson).
- `rangeserver.py` — (Optional) Python HTTP server with CORS and Range support for COGs.
- `photos_origin.geojson` — Example photo marker data.
- `COG_*.tif` — Cloud-Optimized GeoTIFF raster overlays.

---

## myscript.js: Structure & Deep Dive

### 1. URL Parameter Handling
- Parses `layers`, `center`, and `zoom` from the URL.
- If `layers` is present, only those overlays are shown (with optional opacity via `:`).
- If not, all overlays use their config defaults.
- Example: `?layers=1884:0.5,1964:0.8,1940`.

### 2. Layer Configuration (`LAYER_CONFIG`)
- All map layers (basemaps, overlays, images, geojson) are defined here.
- Each layer has:
  - `id`, `name`, `url`, `opacity`, `visible`, `layerType`, `showInControl`, etc.
- Overlays can be toggled and have their opacity set via URL or config.

### 3. Map Initialization
- `initMap()` orchestrates map creation, layer addition, controls, and UI setup.
- `createMap()` sets up the Leaflet map, using center/zoom from URL or defaults.

### 4. Layer Addition
- `addBasemaps()`, `addRasterLayers()`, `addPhotoLayers()`, `addImageOverlays()`
- Each function reads from `LAYER_CONFIG` and adds the appropriate Leaflet/GeoRasterLayer/GeoJSON/ImageOverlay.
- Raster layers support grayscale rendering if specified.

### 5. Layer Controls & Opacity
- All overlays appear in a single `L.control.layers` panel.
- Opacity sliders are dynamically generated and update the map in real time.

### 6. Custom Controls
- Includes a reset zoom button and user geolocation via `leaflet-locatecontrol`.

### 7. Utility Functions
- Fetch JSON, filter layers by ID, log all layer IDs, etc.

---

## Actionable Examples

### Show Only 1884 and 1964 Layers, Custom Opacity
```
map.html?layers=1884:0.5,1964:0.8&center=41.355,14.371&zoom=18
```

### Show All Layers (Default)
```
map.html
```

### Show Only 1940 Layer, Default Opacity
```
map.html?layers=1940
```

---

## Troubleshooting & FAQ

### Common Issues
- **COG/GeoTIFF not displaying:** Ensure your server supports HTTP Range requests and CORS.
- **Layer not visible:** Check the `layers` URL param and `LAYER_CONFIG` for correct `name` and `visible` settings.
- **Opacity not updating:** Make sure the layer is listed in the URL and the value is a valid number between 0 and 1.
- **Map not centering/zooming:** Check the `center` and `zoom` URL params for valid values.

### Debugging Tips
- Use browser dev tools to inspect network requests for COG tiles.
- Use the console utility functions in `myscript.js` to log and filter layers.
- Check for errors in the browser console for missing files or CORS issues.

---

## Workflow Integration
- All configuration is code-driven and version-controlled in `myscript.js` and `map.html`.
- Add new layers or change defaults by editing `LAYER_CONFIG`.
- Documentation and usage examples are kept in this README for easy onboarding and reference.

---

## Contributing & Extending
- Fork the repo and submit PRs for new features, bug fixes, or documentation improvements.
- Add new overlays, basemaps, or controls by extending `LAYER_CONFIG` and the relevant functions in `myscript.js`.
- For advanced use, integrate with other Leaflet plugins or custom data sources.

---

## Credits
- [GeoTIFF/georaster-layer-for-leaflet](https://github.com/GeoTIFF/georaster-layer-for-leaflet/)
- [Leaflet](https://leafletjs.com/)
- [RangeHTTPServer](https://github.com/danvk/RangeHTTPServer)
- [leaflet-locatecontrol](https://github.com/domoritz/leaflet-locatecontrol)
- [Contributors](https://github.com/kidpixo/leaflet-test/graphs/contributors)
