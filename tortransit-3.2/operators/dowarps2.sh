#!/bin/sh
if [ $# -lt 1 ]; then
    echo Syntax: dowarps2.sh BASE \[WIDTHPIX\]
    exit 1
fi

echo Doing ${BASE}

export BASE=$1
POINTS=`tail +2 ${BASE}.png.points | awk -F, '{ORS=""; print "-gcp "$3+0" "(-$4+0)" "$1+0" "$2+0" "}'`
if [ $# -ge 2 ]; then
    export WIDTH_PIX="-ts $2 0"
else
    export WIDTH_PIX=
fi

rm -f ${BASE}_UTM17N.tif
rm -f ${BASE}_SM.tif
rm -f ${BASE}_SM.vrt
rm -f ${BASE}_SM_half.png
rm -f ${BASE}_SM_half.vrt
rm -f ${BASE}_WGS84.tif
rm -f ${BASE}_WGS84.vrt
rm -f ${BASE}_WGS84_half.vrt
rm -f ${BASE}_WGS84_half.png
rm -f temp.tif


gdal_translate -of GTiff \
    $POINTS \
    ${BASE}.png temp.tif \
    || return 1


# Control points are in UTM17N; required to warp to this space first.
# Note NO dstalpha - source image has alpha
gdalwarp -r lanczos -order 1 \
    -t_srs EPSG:26917 \
    $WIDTH_PIX \
    temp.tif ${BASE}_UTM17N.tif
rm temp.tif
gdal_translate ${BASE}_UTM17N.tif temp.tif -co compress=lzw && \
    mv temp.tif ${BASE}_UTM17N.tif

# Convert to WGS84 - for Google Earth
gdalwarp -r lanczos -t_srs EPSG:4326 \
    ${BASE}_UTM17N.tif ${BASE}_WGS84.tif
# Compress
gdal_translate ${BASE}_WGS84.tif temp.tif -co compress=lzw && \
    mv temp.tif ${BASE}_WGS84.tif

# Convert to Spherical Mercator - for Google Maps
gdalwarp -r lanczos -t_srs EPSG:3857 \
    ${BASE}_UTM17N.tif ${BASE}_SM.tif
# Compress
gdal_translate ${BASE}_SM.tif temp.tif -co compress=lzw && \
    mv temp.tif ${BASE}_SM.tif

gdalbuildvrt ${BASE}_WGS84.vrt ${BASE}_WGS84.tif
# Build a VRT with half the pixels in both x and y.
# Means doubling the pixel-step (in GeoTransform) and halving the pixels
cat ${BASE}_WGS84.vrt \
    | awk -F[,\<\>] '$2 == "GeoTransform" { $4 *= 2; $8 *= 2; print "<"$2">"$3","$4","$5","$6","$7","$8"<"$9">" }; $2 != "GeoTransform" { print; } ' \
    | awk -F \" '/Rect/ { OFS="\""; $6/=2; $8/=2; print } !/Rect/ { print }' \
    | awk -F \" '/RasterXSize/ { OFS="\""; $2/=2; $4/=2; $8/=2; print } !/RasterXSize/ { print }' \
    | sed 's/.tif/_half.png/g' \
    > ${BASE}_WGS84_half.vrt

gdalbuildvrt ${BASE}_SM.vrt ${BASE}_SM.tif
# Build a VRT with half the pixels in both x and y.
# Means doubling the pixel-step (in GeoTransform) and halving the pixels
cat ${BASE}_SM.vrt \
    | awk -F[,\<\>] '$2 == "GeoTransform" { $4 *= 2; $8 *= 2; print "<"$2">"$3","$4","$5","$6","$7","$8"<"$9">" }; $2 != "GeoTransform" { print; } ' \
    | awk -F \" '/Rect/ { OFS="\""; $6/=2; $8/=2; print } !/Rect/ { print }' \
    | awk -F \" '/asterXSize/ { OFS="\""; $2/=2; $4/=2; $8/=2; print } !/asterXSize/ { print }' \
    | sed 's/.tif/_half.png/g' \
    > ${BASE}_SM_half.vrt

# Ideally, we could do this via batch.
# Unfortunately, imagemagick sucks for images this big.
#convert -filter Lanczos -resize 50% \
#    ${BASE}_WGS84.tif \
#    ${BASE}_WGS84_half.png

echo Please create ${BASE}_WGS84_half.png and ${BASE}_SM_half.png by scaling
echo down by half with Gimp.
