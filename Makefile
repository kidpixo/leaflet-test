.PHONY: help build run-docker run-system run-conda convert-docker convert-system convert-conda
.DEFAULT_GOAL := help
CONDA_ENV ?= leaflet-server
build: ## Build the leaflet-server container image
	podman build -t leaflet-server -f Dockerfile .

run-docker: ## Run the server in a container (Podman)
	podman run --rm -it -p 44000:44000 -v $(PWD):/app leaflet-server

run-system: ## Run the server with system Python
	python scripts/rangeserver.py 44000 && xdg-open http://localhost:44000

run-conda: ## Run the server with conda environment
	conda run -n $(CONDA_ENV) python scripts/rangeserver.py 44000 && xdg-open http://localhost:44000

convert-docker: ## Convert photos CSV to GeoJSON using container
	podman run --rm -it -v $(PWD):/app leaflet-server python scripts/convert_photos_coords.py --input photos/Photos.csv --outdir maps_data

convert-system: ## Convert photos CSV to GeoJSON using system Python
	python scripts/convert_photos_coords.py --input photos/Photos.csv --outdir maps_data

convert-conda: ## Convert photos CSV to GeoJSON using conda environment
	conda run -n $(CONDA_ENV) python scripts/convert_photos_coords.py --input photos/Photos.csv --outdir maps_data

#################################################################################
# Self Documenting Commands                                                     #

help: ## Show help. Only lines with ": ##" will show up!
	@awk -F':[[:space:]]*.*## ' '/^[a-zA-Z0-9_.-]+ *:.*## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)