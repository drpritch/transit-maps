gdal_translate -of GTiff \
    -gcp 2687.18 2937.42 608039 4.83856e+06 \
    -gcp 837.564 2912.74 602453 4.83172e+06 \
    -gcp 4129.51 2754.31 611575 4.84454e+06 \
    -gcp 1639.22 1899.14 601030 4.83769e+06 \
    -gcp 4455.47 1089.58 606265 4.85065e+06 \
    -gcp 1075.04 426.471 593838 4.83989e+06 \
    brampton_175.png temp.tif
# Note NO dstalpha - source image has alpha
gdalwarp -r lanczos -order 1 \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -t_srs EPSG:26917 \
    -ts 12956 0 \
    temp.tif brampton_175_UTM17N.tif
rm temp.tif
# Note NO dstalpha
gdalwarp -r lanczos \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -t_srs EPSG:4326 \
    brampton_175_UTM17N.tif brampton_175_WGS84.tif
