#!/bin/sh
rm -rf 1x
rm -rf 2x
mkdir 1x
mkdir 2x

sh makelabels2.sh < labels-go.txt
mkdir ../labels/gotransit/1x/
mv 1x/*.png ../labels/gotransit/1x/
mkdir ../labels/gotransit/2x/
mv 2x/*.png ../labels/gotransit/2x/

sh makelabels2.sh < labels-ttc.txt
mkdir ../labels/ttc/1x/
mv 1x/*.png ../labels/ttc/1x/
mkdir ../labels/ttc/2x/
mv 2x/*.png ../labels/ttc/2x/

sh makelabels2.sh < labels-viva.txt
mkdir ../labels/viva/1x/
mv 1x/*.png ../labels/viva/1x/
mkdir ../labels/viva/2x/
mv 2x/*.png ../labels/viva/2x/
