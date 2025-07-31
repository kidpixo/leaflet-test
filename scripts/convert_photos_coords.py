import pandas as pd
from shapely.geometry import Point, Polygon
import pathlib
import numpy as np
import geopandas as gpd
import argparse
import sys

# --- Argument parsing ---
def parse_args():
    parser = argparse.ArgumentParser(description="Convert photo coordinates to GeoJSON/GPKG.")
    parser.add_argument('--input', type=str, default='photos/Photos.csv', help='Input CSV file')
    parser.add_argument('--outdir', type=str, default='.', help='Output directory')
    parser.add_argument('--fov_name', type=str, default='photos_fov', help='Output FOV GeoJSON filename (no extension)')
    parser.add_argument('--origin_name', type=str, default='photos_origin', help='Output origin GeoJSON filename (no extension)')
    return parser.parse_args()

# --- Data validation ---
def validate_df(df):
    required_cols = [
        'filename', 'height', 'width',
        'latitude_origin', 'longitude_origin',
        'latitude_vertex_left', 'longitude_vertex_left',
        'latitude_vertex_right', 'longitude_vertex_right'
    ]
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        print(f"Missing columns: {missing}", file=sys.stderr)
        sys.exit(1)
    if df.isnull().any().any():
        print("Warning: NaN values found in input data.", file=sys.stderr)
    return df

# --- Main conversion logic ---
def main():
    args = parse_args()
    in_path = pathlib.Path(args.input)
    out_path = pathlib.Path(args.outdir)
    if not in_path.exists():
        print(f"Input file {in_path} does not exist.", file=sys.stderr)
        sys.exit(1)
    photos_df = pd.read_csv(in_path).dropna().copy()
    validate_df(photos_df)

    for name in ['origin','vertex_left','vertex_right']:
        photos_df[name] = photos_df.apply(lambda row: Point(row[f'longitude_{name}'], row[f'latitude_{name}']), axis=1)

    def create_poly(row):
        origin = Point(row.longitude_origin, row.latitude_origin)
        vertex_left = Point(row.longitude_vertex_left, row.latitude_vertex_left)
        vertex_right = Point(row.longitude_vertex_right, row.latitude_vertex_right)
        return Polygon((origin, vertex_left, vertex_right, origin))

    photos_df['origin'] = photos_df.apply(lambda row: Point(row.longitude_origin, row.latitude_origin), axis=1)
    photos_df['fov'] = photos_df.apply(create_poly, axis=1)

    def calculate_boresight(row):
        VL_vec = np.array([row.longitude_vertex_left-row.longitude_origin, row.latitude_vertex_left-row.latitude_origin])
        VR_vec = np.array([row.longitude_vertex_right-row.longitude_origin, row.latitude_vertex_right-row.latitude_origin])
        boresight = VL_vec + (VR_vec - VL_vec) / 2
        norm = np.linalg.norm(boresight, ord=2)
        if norm == 0:
            row['x_boresight'] = 0
            row['y_boresight'] = 0
        else:
            x_boresight, y_boresight = boresight / norm
            row['x_boresight'] = x_boresight
            row['y_boresight'] = y_boresight
        return row

    photos_df = photos_df.apply(calculate_boresight, axis=1)
    photos_df['height'] = 2 * photos_df.height / photos_df.width
    photos_df['width'] = 2.0

    # Drop columns safely
    drop_cols = [
        'latitude_origin', 'longitude_origin',
        'latitude_vertex_left', 'longitude_vertex_left', 'vertex_left',
        'latitude_vertex_right', 'longitude_vertex_right', 'vertex_right'
    ]
    photos_df = photos_df.drop(columns=[c for c in drop_cols if c in photos_df.columns])

    photos_geodf = gpd.GeoDataFrame(photos_df.copy(), geometry=photos_df.fov)
    photos_geodf.crs = "EPSG:4326"

    # Write FOV GeoJSON
    fov_outfile = out_path / f"{args.fov_name}.geojson"
    photos_geodf.drop(columns=['origin','fov']).to_file(fov_outfile, driver='GeoJSON')

    # Write origin GeoJSON
    origin_outfile = out_path / f"{args.origin_name}.geojson"
    photos_geodf.set_geometry('origin').drop(columns=['geometry','fov']).to_file(origin_outfile, driver='GeoJSON')

if __name__ == "__main__":
    main()
