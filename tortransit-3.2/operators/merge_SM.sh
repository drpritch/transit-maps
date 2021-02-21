#!/bin/sh
# Merge the Spherical Mercator images - for Google Maps

    #-co "BIGTIFF=YES"
rm -f temp.tif
gdalwarp \
    -te -8910596 5332640 -8745156 5491216 \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -r lanczos \
    -ts 33000 0 \
    toronto/toronto_334_SM_half.vrt \
    mississauga/mississauga_200_SM_half.vrt \
    york/york_366_SM_half.vrt \
    brampton/brampton_175_SM_half.vrt \
    durham/durham_west_112_SM_half.vrt \
    durham/durham_east_146_SM_half.vrt \
    durham/durham_clarington_237_4_SM_half.vrt \
    oakville/oakville_350_SM_half.vrt \
    milton/milton_125_SM_half.vrt \
    hamilton/hamilton_175_SM_half.vrt \
    burlington/burlington_419_4_SM_half.vrt \
    temp.tif
gdal_translate temp.tif merged_SM.tif -co compress=lzw && \
    rm temp.tif
