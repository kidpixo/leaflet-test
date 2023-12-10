## Test for Leaflet

I am trying to visualize some maps with Leaflets.

I want to use a particular type of GeoTiff image called COG defined [as](https://www.usgs.gov/faqs/what-are-cloud-optimized-geotiffs-cogs) 

> A Cloud Optimized GeoTIFF (COG) is a GeoTIFF file with an internal organization that enables more efficient workflows in the cloud environment.  It does this by leveraging the ability of clients issuing ​HTTP GET range requests to ask for just the parts of a file they need.

## Roadmap 

- [x] Leafeat maps with a COG layer via [GeoTIFF/georaster-layer-for-leaflet](https://github.com/GeoTIFF/georaster-layer-for-leaflet/)  (thanks [anddam (anddam)](https://github.com/anddam))
- [x] add layers to control panel  (thanks [well-it-wasnt-me (Antonio)](https://github.com/well-it-wasnt-me))
- [x] add an opacity slider to the controls (thanks [well-it-wasnt-me (Antonio)](https://github.com/well-it-wasnt-me)) 
- [x] add bing photo layer: hot to hide the API Key?
- [ ] fix bing layer disappearing at zoom 19

## Run it - simple way 

you need an http server that understand [HTTP range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests) like [danvk/RangeHTTPServer: SimpleHTTPServer with support for Range requests](https://github.com/danvk/RangeHTTPServer/).

Install `pip install RangeHTTPServer` and run `python -m RangeHTTPServer 44000`

This doesn't care/handle [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## Run it - better way 

Run `python rangeserver.py` , it runs an exended `RangeHTTPServer` to handle CORS.
