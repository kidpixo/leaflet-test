# Leaflet Historical Map Viewer: Developer Documentation

## Problem-First Approach

### The Problem
Web developers and digital historians often need to overlay historical, georeferenced maps and photos on top of modern basemaps, allowing users to explore changes over time. The challenge is to:
- Efficiently serve and visualize large raster datasets (COG/GeoTIFF) in the browser.
- Provide interactive controls for toggling layers, adjusting opacity, and filtering by year.
- Make the map state easily shareable and reproducible via URL parameters.
- Support extensibility for new datasets and overlays.

### The Solution
This project leverages Leaflet.js, georaster-layer-for-leaflet, and a modular, developer-friendly JavaScript architecture to deliver:
- Fast, partial loading of large COG rasters.
- Dynamic layer control, opacity sliders, and a timeline slider for year-based filtering.
- GeoJSON photo markers with popups.
- URL-driven configuration for sharing and embedding custom map views.
- Easy extensibility for new layers and datasets.

---

## Story-Code-Context Pattern

### Story (Why)
- **Purpose:** Enable interactive exploration of historical maps and photos for a small town, visualizing changes in buildings, rivers, and urban landscape over time.
- **Motivation:** Lower the barrier for historians, researchers, and developers to publish and explore geospatial archives.
- **Design Choices:**
  - Use COGs for efficient raster streaming.
  - Centralize layer configuration for easy adaptation.
  - Expose all controls and state via URL for reproducibility.
  - Use Bootstrap for clean, responsive UI elements.

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
    year: "1884",
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
- Use this project to visualize any set of georeferenced rasters and overlays in Leaflet.
- Adaptable to any static or Python HTTP server supporting Range requests.
- Easily extendable: add new layers, markers, or controls by editing `LAYER_CONFIG` and `myscript.js`.
- URL-driven configuration is ideal for sharing specific map views or embedding in other web apps.

---

## Progressive Disclosure: Project Structure

- `map.html` — Main HTML entry point, includes all CSS/JS dependencies and the map container.
- `myscript.js` — Core logic for map creation, layer management, URL parsing, and UI controls.
- `LAYER_CONFIG` — Centralized configuration for all map layers (basemaps, overlays, images, geojson).
- `rangeserver.py` — (Optional) Python HTTP server with CORS and Range support for COGs.
- `photos_origin.geojson` — Example photo marker data.
- `COG_*.tif` — Cloud-Optimized GeoTIFF raster overlays.

---

## myscript.js: Structure & Deep Dive

### 1. Layer Configuration (`LAYER_CONFIG`)
- All map layers (basemaps, overlays, images, geojson) are defined in a single object.
- Each layer has:
  - `id`, `name`, `year` (for timeline), `url`, `opacity`, `visible`, `layerType`, `showInControl`, etc.
- To add new data, simply add a new entry to `LAYER_CONFIG`.

### 2. URL Parameter Handling
- Parses `layers`, `center`, and `zoom` from the URL.
- If `layers` is present, only those overlays are shown (with optional opacity via `:`).
- If not, all overlays use their config defaults.
- Example: `?layers=1884:0.5,1964:0.8,1940`.

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

### 6. Timeline Slider (Year-Based Filtering)
- If multiple visible overlays have a `year`, a timeline slider appears at the bottom of the map.
- Moving the slider fades between years, updating layer opacity and syncing the control panel.
- If only one visible layer with a year, the slider is hidden.
- The slider only uses layers currently visible (e.g., filtered by URL).

### 7. Custom Controls
- Includes a reset zoom button and user geolocation via `leaflet-locatecontrol`.

### 8. Utility Functions
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

### Add a New Raster Layer
```js
LAYER_CONFIG["RASTER_2000"] = {
  id: "2000",
  type: "overlay",
  name: "2000",
  year: "2000",
  url: BASE_URL + "COG_2000.tif",
  opacity: 0.7,
  slider: true,
  visible: true,
  layerType: "georaster",
  extraOptions: { resolution: 256 },
  showInControl: true
};
```

---

## Troubleshooting & FAQ

### Common Issues
- **COG/GeoTIFF not displaying:** Ensure your server supports HTTP Range requests and CORS.
- **Layer not visible:** Check the `layers` URL param and `LAYER_CONFIG` for correct `name` and `visible` settings.
- **Opacity not updating:** Make sure the layer is listed in the URL and the value is a valid number between 0 and 1.
- **Timeline slider not showing:** Ensure at least two visible overlays have a `year` property.
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
