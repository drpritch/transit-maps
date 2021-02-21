gdal_translate -of GTiff \
    -gcp  92.801 7214.08 607051 4.85086e+06 \
    -gcp 632.874 8819.07 611575 4.84454e+06 \
    -gcp 8307.26 8416.26 644639 4.85659e+06\
    -gcp 4185.21 7190.5  624961 4.85643e+06 \
    -gcp 8603.53 5315.83 641800 4.87057e+06 \
    -gcp 8385.09 1223.46 635360 4.88822e+06 \
    -gcp 4303.86 3730.41 620834 4.87176e+06 \
    -gcp 5704.38 2048.03 624718 4.88101e+06 \
    york_350.png temp.tif
# Note NO dstalpha - source image has alpha
gdalwarp -r lanczos -order 1 \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -ts 22362 0 \
    -t_srs EPSG:26917 \
    temp.tif york_350_UTM17N.tif
rm temp.tif
# Note NO dstalpha
gdalwarp -r lanczos \
    --config GDAL_CACHEMAX 500 -wm 500 \
    -t_srs EPSG:4326 \
    york_350_UTM17N.tif york_350_WGS84.tif
