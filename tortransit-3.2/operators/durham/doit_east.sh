gdal_translate -of GTiff \
    -gcp 219.935 3938.37 664476 4.85795e+06 \
    -gcp 625.14 756.144 662055 4.87014e+06 \
    -gcp 3955.99 3927.88 678191 4.86258e+06 \
    -gcp 3399.35 1764.01 673489 4.86985e+06 \
    -gcp 2352.9 3568.14 671861 4.86194e+06 \
    durham_east_200.png temp.tif
# Note NO dstalpha - source image has alpha
gdalwarp -r lanczos -order 1 \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -ts 11066 0 \
    -t_srs EPSG:26917 \
    temp.tif durham_east_200_UTM17N.tif
rm temp.tif
# Note NO dstalpha
gdalwarp -r lanczos \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -t_srs EPSG:4326 \
    durham_east_200_UTM17N.tif durham_east_200_WGS84.tif
