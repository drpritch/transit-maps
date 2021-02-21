gdal_translate -of GTiff \
    -gcp 3548.58 2154.62 614864 4.83316e+06 \
    -gcp 880.798 3063.09 610320 4.82006e+06 \
    -gcp 1767.74 345.068 602453 4.83172e+06 \
    -gcp 3563.83 386.178 608039 4.83856e+06 \
    -gcp 2992.66 3343.84 617806 4.82741e+06 \
    mississauga_200.png temp.tif
# Note NO dstalpha - source image has alpha
gdalwarp -r lanczos -order 1 \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -t_srs EPSG:26917 \
    -ts 9600 0 \
    temp.tif mississauga_200_UTM17N.tif
rm temp.tif
# Note NO dstalpha
gdalwarp -r lanczos \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -t_srs EPSG:4326 \
    mississauga_200_UTM17N.tif mississauga_200_WGS84.tif
