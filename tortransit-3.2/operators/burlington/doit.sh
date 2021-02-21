#!/bin/sh
export BASE=burlington_425
gdal_translate -of GTiff \
    -gcp 3589.64 1904.09 601737 4.8016e+06 \
    -gcp 3586.95 169.578 595922 4.80723e+06 \
    -gcp 1356.45 1543.12 593270 4.79529e+06 \
    -gcp 1240.99 470.497 589301 4.79839e+06 \
    -gcp 2564.45 1546.69 597212 4.79933e+06 \
    -gcp 437.537 2134.64 592258 4.79029e+06 \
    ${BASE}.png temp.tif

# Control points are in UTM17N; required to warp to this space first.
# Note NO dstalpha - source image has alpha
gdalwarp -r lanczos -order 1 \
    -t_srs EPSG:26917 \
    -ts 9436 0 \
    temp.tif ${BASE}_UTM17N.tif
rm temp.tif
gdal_translate ${BASE}_UTM17N.tif temp.tif -co compress=lzw && \
    mv temp.tif ${BASE}_UTM17N.tif

# Note NO dstalpha
gdalwarp -r lanczos -t_srs EPSG:4326 \
    ${BASE}_UTM17N.tif ${BASE}_WGS84.tif
gdal_translate ${BASE}_WGS84.tif temp.tif -co compress=lzw && \
    mv temp.tif ${BASE}_WGS84.tif
