# ---
# jupyter:
#   jupytext:
#     formats: ipynb,py:percent
#     text_representation:
#       extension: .py
#       format_name: percent
#       format_version: '1.3'
#       jupytext_version: 1.16.0
#   kernelspec:
#     display_name: Python 3 (ipykernel)
#     language: python
#     name: python3
# ---

# %%
import pandas as pd
from shapely.geometry import Point, Polygon
import pathlib
import numpy as np
import geopandas as gpd

# %%
photos_df = pd.read_csv('photos/Photos.csv').dropna()
print(photos_df)
# %%
for name in ['origin','vertex_left','vertex_right'] :
    photos_df[f'{name}'] = photos_df.apply(lambda row: Point(row[f'longitude_{name}'], row[f'latitude_{name}']),axis=1)

# %%
def create_poly(row):
    origin = Point(row.longitude_origin, row.latitude_origin)
    vertex_left = Point(row.longitude_vertex_left, row.latitude_vertex_left)
    vertex_right = Point(row.longitude_vertex_right, row.latitude_vertex_right)
    return Polygon((origin,vertex_left,vertex_right,origin))

photos_df['origin'] = photos_df.apply(lambda row: Point(row.longitude_origin, row.latitude_origin),axis=1)
photos_df['fov'] = photos_df.apply(create_poly,axis=1)

def calculate_boresight(row):
    VL_vec = np.array([photos_df.longitude_vertex_left-photos_df.longitude_origin,photos_df.latitude_vertex_left-photos_df.latitude_origin])
    # print(f'{VL_vec=}')
    VR_vec = np.array([photos_df.longitude_vertex_right-photos_df.longitude_origin,photos_df.latitude_vertex_right-photos_df.latitude_origin])
    # print(f'{VR_vec=}')
    # boresight as middle vactor between vertexes
    boresight = VL_vec+(VR_vec-VL_vec)/2
    # normalised boresight
    x_boresight, y_boresight = boresight/np.linalg.norm(boresight, ord=2) 
    # print(f'{x_boresight=}')
    # print(f'{y_boresight=}')
    row['x_boresight'] = x_boresight[0]
    row['y_boresight'] = y_boresight[0]
    return row

# calculate and add boresight
photos_df = photos_df.apply(calculate_boresight,axis=1)
photos_df['height'] = photos_df.height / photos_df.width
photos_df['width'] = 1. # set to 1 mt
print(photos_df.apply(lambda x: f'<a-image src="photos/{x.filename}" width="{x.width}" height="{x.height}" gps-new-entity-place="latitude: {x.latitude_origin}; longitude: {x.longitude_origin}" position="0 0 0" ></a-image>',axis=1).values)

# drop some columns
photos_df = photos_df.drop(columns=[ 'latitude_origin', 'longitude_origin',
       'latitude_vertex_left', 'longitude_vertex_left','vertex_left',
       'latitude_vertex_right', 'longitude_vertex_right','vertex_right'
        ])

# %%
photos_geodf = gpd.GeoDataFrame(photos_df,geometry=photos_df.fov)
photos_geodf.crs = "EPSG:4326"
print(photos_geodf)
# write output
out_path = pathlib.Path("")

# %%
outfile = 'photos_fov'
photos_geodf.drop(columns=['origin','fov']).to_file(out_path / f"{outfile}.geojson", driver='GeoJSON')
# photos_geodf.drop(columns=['origin','fov']).to_file(out_path / f"{outfile}.gpkg",layer='fovs', driver="GPKG")

# %%
outfile = 'photos_origin'
# set_geometry switch which columns is geometry
photos_geodf.set_geometry('origin').drop(columns=['geometry','fov']).to_file(out_path / f"{outfile}.geojson", driver='GeoJSON')
# photos_geodf.set_geometry('origin').drop(columns=['geometry','fov']).to_file(out_path / f"{outfile}.gpkg",layer='fovs', driver="GPKG")
