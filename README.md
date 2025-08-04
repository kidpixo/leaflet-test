# Leaflet Historical Map Viewer: Developer Documentation

## Prerequisites

- For development and serving COG/GeoTIFF files locally, you need Python 3.x.
- Required Python package: `RangeHTTPServer`.
- No Node.js or npm is required for basic usage or GitHub Pages deployment. JavaScript libraries are loaded via CDN in `map.html`.

## Quick Start

1. **Install Python requirements**

   Using pip:
   ```sh
   pip install RangeHTTPServer
   ```
   Or with conda:
   ```sh
   conda install -c conda-forge rangehttpserver
   ```

2. **Start the local server**

   ```sh
   python rangeserver.py
   # Or specify a port:
   python rangeserver.py 44000
   ```

3. **Open the demo**

   Open your browser at:
   ```
   http://localhost:44000/map.html
   ```

---

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

## Project Structure

```
leaflet-test/
├── Dockerfile
├── Makefile
├── environment_server.yml
├── requirements_server.txt
├── map.html
├── myscript.js
├── rangeserver.py
├── scripts/
│   ├── convert_photos_coords.py
│   ├── validate_geojson.py
├── maps_data/
│   ├── geojson_schema.json
│   ├── photos_fov.geojson
│   ├── photos_origin.geojson
├── photos/
│   ├── Photos.csv
│   └── ...
```

## Docker & Makefile Usage

### Build the Docker image
```sh
make build
```

### Run the server in a container (with live code from your project)
```sh
make run-docker
```

### Run the server with system Python
```sh
make run-system
```

### Run the server with conda
```sh
make run-conda
```

### Run the conversion script in a container
```sh
make convert-docker
```

### Run the conversion script with system Python
```sh
make convert-system
```

### Run the conversion script with conda
```sh
make convert-conda
```

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

---

## Layer Configuration: Structure & Overlay Order

#### How Overlay Order Works
- The order of overlays in the map and in the layer control panel is determined by the order of keys in the `LAYER_CONFIG` object in `myscript.js`.
- When building the overlay list for `L.control.layers`, overlays are added in the order they appear in `LAYER_CONFIG`.
- To change the stacking or control order, simply rearrange the overlay entries in `LAYER_CONFIG`.
- Leaflet will respect this order both at map creation and when toggling overlays on/off via the control panel.

#### LAYER_CONFIG: Key Reference
Each entry in `LAYER_CONFIG` defines a map layer. The following keys are supported:

| Key            | Required | Type      | Description                                                                 |
|----------------|----------|-----------|-----------------------------------------------------------------------------|
| `id`           | Yes      | String    | Unique identifier for the layer. Used for internal reference.               |
| `type`         | Yes      | String    | Layer type: `basemap` or `overlay`.                                        |
| `name`         | Yes      | String    | Display name for the layer (shown in controls and popups).                  |
| `year`         | No       | String    | Year for timeline slider (only for overlays with historical data).          |
| `url`          | Yes      | String    | Data source URL (tile, raster, image, or geojson).                          |
| `opacity`      | Yes      | Number    | Initial opacity (0-1). Can be changed via slider or URL param.              |
| `visible`      | Yes      | Boolean   | Whether the layer is shown by default.                                      |
| `layerType`    | Yes      | String    | Type of Leaflet layer: `tile`, `georaster`, `image`, `geojson`, `bing`.     |
| `showInControl`| No       | Boolean   | If false, layer is hidden from the control panel. Default: true.            |
| `slider`       | No       | Boolean   | If true, an opacity slider is shown in the control panel.                   |
| `extraOptions` | No       | Object    | Additional options for the layer (e.g., resolution for rasters).            |
| `grayscale`    | No       | Boolean   | If true, raster is rendered in grayscale.                                   |
| `imageBounds`  | No       | Array     | Bounds for image overlays ([SW, NE] lat/lng pairs).                         |

**Minimal required keys:** `id`, `type`, `name`, `url`, `opacity`, `visible`, `layerType`

#### Example
```js
const LAYER_CONFIG = {
  RASTER_1884: {
    id: "1884",           // Unique layer ID
    type: "overlay",      // Overlay type
    name: "1884",         // Display name
    year: "1884",         // Year (for timeline)
    url: BASE_URL + "COG_1884.tif", // Data source
    opacity: 0.7,          // Initial opacity
    visible: true,         // Shown by default
    layerType: "georaster", // Layer type
    showInControl: true,   // Show in control panel
    slider: true,          // Show opacity slider
    extraOptions: { resolution: 256 }, // Additional options
    grayscale: false       // Render in color
  },
  // ... more layers ...
};
```

**To add or reorder overlays:**
- Add new entries to `LAYER_CONFIG` in the desired order.
- The order of keys determines the stacking and control panel order.
- No need for a separate config array or zIndex unless you want dynamic reordering.

---
