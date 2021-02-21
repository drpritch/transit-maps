gdal_translate -of GTiff \
    -gcp 426.4 2971.71 650496 4.85202e+06 \
    -gcp 373.277 1488.72 648301 4.85788e+06 \
    -gcp 3530.55 2641.74 662444 4.85749e+06 \
    -gcp 3516.73 216.941 659153 4.86715e+06 \
    -gcp 1563.32 2816.23 654825 4.85417e+06\
    durham_west_150.png temp.tif
# Note NO dstalpha - source image has alpha
gdalwarp -r lanczos -order 1 \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -ts 9442 0 \
    -t_srs EPSG:26917 \
    temp.tif durham_west_150_UTM17N.tif
rm temp.tif
# Note NO dstalpha
gdalwarp -r lanczos \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -t_srs EPSG:4326 \
    durham_west_150_UTM17N.tif durham_west_150_WGS84.tif
