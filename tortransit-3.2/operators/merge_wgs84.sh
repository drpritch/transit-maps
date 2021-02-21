#!/bin/sh
# Merge WGS84 images - for Google Earth

    #-ts 52000 0
    #-co "BIGTIFF=YES"
    #-ts 26000 0
gdalwarp \
    -te -80.0452 43.1087 -78.5590 44.1906 \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -r lanczos \
    -ts 35000 0 \
    toronto/toronto_334_WGS84_half.vrt \
    mississauga/mississauga_200_WGS84_half.vrt \
    york/york_366_WGS84_half.vrt \
    brampton/brampton_175_WGS84_half.vrt \
    durham/durham_west_112_WGS84_half.vrt \
    durham/durham_east_146_WGS84_half.vrt \
    durham/durham_clarington_237_4_WGS84_half.vrt \
    oakville/oakville_350_WGS84_half.vrt \
    hamilton/hamilton_175_WGS84_half.vrt \
    burlington/burlington_419_4_WGS84_half.vrt \
    milton/milton_125_WGS84_half.vrt \
    temp.tif
gdal_translate temp.tif merged_wgs84.tif -co compress=lzw && \
    rm temp.tif
