import json
import jsonschema
import argparse
import sys
from pathlib import Path

def validate_geojson(geojson_path, schema_path):
    with open(schema_path) as f:
        schema = json.load(f)
    with open(geojson_path) as f:
        data = json.load(f)
    try:
        jsonschema.validate(instance=data, schema=schema)
        print(f"{geojson_path} is valid GeoJSON.")
        return True
    except jsonschema.ValidationError as e:
        print(f"Validation error in {geojson_path}: {e.message}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Error validating {geojson_path}: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate a GeoJSON file against a schema.")
    parser.add_argument("geojson", type=str, help="Path to the GeoJSON file to validate.")
    parser.add_argument("--schema", type=str, default="../maps_data/geojson_schema.json", help="Path to the GeoJSON schema file.")
    args = parser.parse_args()
    validate_geojson(args.geojson, args.schema)
