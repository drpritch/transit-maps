#!/bin/sh
rm -rf 1x
rm -rf 2x
mkdir 1x
mkdir 2x

rm *.png
sh makelabels2.sh < labels.txt
mv *.png ../labels/
mkdir ../labels/1x/
mv 1x/*.png ../labels/1x/
mkdir ../labels/2x/
mv 2x/*.png ../labels/2x/
