#!/bin/sh
export BASE=milton_400
gdal_translate -of GTiff \
    -gcp 2133.48 1927.4 595238 4.81933e+06  \
    -gcp 633.85 840.086 589878 4.81789e+06  \
    -gcp 1601.44 403.626 590684 4.82097e+06  \
    -gcp 352.577 1460.56 590789 4.81607e+06 \
    ${BASE}.png temp.tif


# Control points are in UTM17N; required to warp to this space first.
# Note NO dstalpha - source image has alpha
gdalwarp -r lanczos -order 1 \
    -t_srs EPSG:26917 \
    -ts 5942 0 \
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
#convert -filter Lanczos -resize 50% \
#    ${BASE}_WGS84.tif \
#    ${BASE}_WGS84_half.png
