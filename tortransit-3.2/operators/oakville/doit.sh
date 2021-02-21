#!/bin/sh
export BASE=oakville_200
gdal_translate -of GTiff \
    -gcp 3375.39 2386.02 610812 4.81518e+06 \
    -gcp 2484.16 486.163 602007 4.8173e+06 \
    -gcp 669.563 2500.98 604119 4.80583e+06\
    -gcp 604.277 1030.59 598910 4.80951e+06 \
    -gcp 2235.88 2166.29 607058 4.81194e+06 \
    -gcp 3434.98 1731.02 608858 4.81711e+06 \
    -gcp 1876.22 1355.59 603348 4.81284e+06 \
    -gcp 2935.49 998.631 604998 4.81747e+06 \
    -gcp 1068.22 1475.54 601652 4.80993e+06 \
    ${BASE}.png temp.tif

# Control points are in UTM17N; required to warp to this space first.
# Note NO dstalpha - source image has alpha
gdalwarp -r lanczos -order 1 \
    -t_srs EPSG:26917 \
    -ts 9354 0 \
    temp.tif ${BASE}_UTM17N.tif
rm temp.tif
gdal_translate ${BASE}_UTM17N.tif temp.tif -co compress=lzw && \
    mv temp.tif ${BASE}_UTM17N.tif

# Note NO dstalpha
gdalwarp -r lanczos -t_srs EPSG:4326 \
    ${BASE}_UTM17N.tif ${BASE}_WGS84.tif
gdal_translate ${BASE}_WGS84.tif temp.tif -co compress=lzw && \
    mv temp.tif ${BASE}_WGS84.tif

gdalbuildvrt ${BASE}_WGS84.vrt ${BASE}_WGS84.tif
cat ${BASE}_WGS84.vrt \
    | awk -F[,\<\>] '$2 == "GeoTransform" { $4 *= 2; $8 *= 2; print "<"$2">"$3","$4","$5","$6","$7","$8"<"$9">" }; $2 != "GeoTransform" { print; } ' \
    | awk -F \" '/Rect/ { OFS="\""; $6/=2; $8/=2; print } !/Rect/ { print }' \
    | awk -F \" '/RasterXSize/ { OFS="\""; $2/=2; $4/=2; $8/=2; print } !/RasterXSize/ { print }' \
    | sed 's/.tif/_half.png/g' \
    > ${BASE}_WGS84_half.vrt
