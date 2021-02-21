#!/bin/sh
export BASE=toronto__400
gdal_translate -of GTiff \
    -gcp 5107.96 5986.28 629536 4.83343e+06  \
    -gcp 6034.71 3025.72 629248 4.84839e+06  \
    -gcp 2193.64 5083.1 614864 4.83316e+06 \
    -gcp 2293.41 2629.4 611575 4.84454e+06  \
    -gcp 8728.7 4643.82 644000 4.84508e+06 \
    ${BASE}.tif temp.tif

# Control points are in UTM17N; required to warp to this space first.
# Note NO dstalpha - source image has alpha
gdalwarp -r lanczos -order 1 \
    -t_srs EPSG:26917 \
    -ts 24634 0 \
    temp.tif ${BASE}_UTM17N.tif
rm temp.tif
gdal_translate ${BASE}_UTM17N.tif temp.tif -co compress=lzw && \
    mv temp.tif ${BASE}_UTM17N.tif

# Note NO dstalpha
gdalwarp -r lanczos -t_srs EPSG:4326 \
    ${BASE}_UTM17N.tif ${BASE}_WGS84.tif
gdal_translate ${BASE}_WGS84.tif temp.tif -co compress=lzw && \
    mv temp.tif ${BASE}_WGS84.tif
