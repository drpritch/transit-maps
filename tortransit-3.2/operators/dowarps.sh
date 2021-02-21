#!/bin/sh

# Generate warped image files for all municipalities.
#
# Second parameter is width of intermediate UTM17N image, in pixels.
# This is determined by running once with no argument, viewing the
# gdalwarp default output width, and then mulitplying that width by two.
# Intention is to supersample by 2x.
#
./dowarps2.sh toronto/toronto_334 24634
./dowarps2.sh durham/durham_west_112 9442
./dowarps2.sh durham/durham_east_146 11066
./dowarps2.sh durham/durham_clarington_237_4 6860
./dowarps2.sh york/york_366 22362
./dowarps2.sh brampton/brampton_175 12956
./dowarps2.sh mississauga/mississauga_200 9600
./dowarps2.sh oakville/oakville_350 9430
./dowarps2.sh burlington/burlington_419_4 9436
./dowarps2.sh milton/milton_125 7028
./dowarps2.sh hamilton/hamilton_175 15648
