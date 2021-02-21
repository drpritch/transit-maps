#!/bin/sh
python2.7 `which gdal2tiles.py` \
    -s EPSG:3857 \
    -z 5-16 \
    merged_SM.tif \
    merged_SM
