#!/bin/sh
export BASE=hamilton_175
gdal_translate -of GTiff \
    -gcp 2567.92 2147.93 592258 4.79029e+06 \
    -gcp 2479.4 1049.33 593270 4.79529e+06 \
    -gcp 2383.4 3611.79 589572 4.78401e+06\
    -gcp 5948.15 2361.85 607019 4.78502e+06 \
    -gcp 502.616 4347.74 580269 4.78314e+06 \
    -gcp 1470.46 640.759 589301 4.79839e+06\
    ${BASE}.png temp.tif

# Control points are in UTM17N; required to warp to this space first.
# Note NO dstalpha - source image has alpha
gdalwarp -r lanczos -order 1 \
    -t_srs EPSG:26917 \
    -ts 15648 0 \
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
