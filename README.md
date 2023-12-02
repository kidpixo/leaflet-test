## Test for Leaflet

Sto cercando di visualizzare alcune mappe con Leaflets.

Volgio usare un particolare tipo di immagine GeoTiff chiamato COG definito [come](https://www.usgs.gov/faqs/what-are-cloud-optimized-geotiffs-cogs) 

> A Cloud Optimized GeoTIFF (COG) is a GeoTIFF file with an internal organization that enables more efficient workflows in the cloud environment.  It does this by leveraging the ability of clients issuing ​HTTP GET range requests to ask for just the parts of a file they need.

La mappa leaflets funziona 

[GeoTIFF/georaster-layer-for-leaflet](https://github.com/GeoTIFF/georaster-layer-for-leaflet/)

Non riesto ad aggiungere il Layer nei controlli, forse perché é definito in una funzione async.

## Run it

you need an http server that understand [HTTP range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests) like [danvk/RangeHTTPServer: SimpleHTTPServer with support for Range requests](https://github.com/danvk/RangeHTTPServer/).

Install `pip install RangeHTTPServer` and run `python -m RangeHTTPServer 44000`
