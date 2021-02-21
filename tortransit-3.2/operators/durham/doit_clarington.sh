gdal_translate -of GTiff \
    -gcp 389.356 2600.66 685452 4.8631e+06 \
    -gcp 629.614 768.269 683839 4.87136e+06 \
    -gcp 2253.84 2741.94 693707 4.86519e+06 \
    -gcp 2185.37 780.768 690582 4.87355e+06 \
    durham_clarington_200.png temp.tif

# Note NO dstalpha - source image has alpha
gdalwarp -r lanczos -order 1 \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -ts 6860 0 \
    -t_srs EPSG:26917 \
    temp.tif durham_clarington_200_UTM17N.tif
rm temp.tif
# Note NO dstalpha
gdalwarp -r lanczos \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -t_srs EPSG:4326 \
    durham_clarington_200_UTM17N.tif durham_clarington_200_WGS84.tif
