.PHONY: build run-docker run-system run-conda convert-docker convert-system convert-conda

build:
	podman build -t leaflet-server -f Dockerfile .

run-docker:
	podman run --rm -it -p 44000:44000 -v $(PWD):/app leaflet-server

run-system:
	python rangeserver.py 44000

run-conda:
	conda run -n leaflet-server python rangeserver.py 44000

convert-docker:
	podman run --rm -it -v $(PWD):/app leaflet-server python scripts/convert_photos_coords.py --input photos/Photos.csv --outdir maps_data

convert-system:
	python scripts/convert_photos_coords.py --input photos/Photos.csv --outdir maps_data

convert-conda:
	conda run -n leaflet-server python scripts/convert_photos_coords.py --input photos/Photos.csv --outdir maps_data
