#!/bin/sh

while read line
do
  echo "$line" | tr [:lower:] [:upper:] | sed 's#@@#\
#g'> /tmp/input.txt
  if grep -qv ^# /tmp/input.txt
  then
    echo $line
    sh genlabelx1.ic
    output=`echo $line | sed 's/@@//g; s/[ -.]//g;' | tr [:upper:] [:lower:]`
    mv foo.png 1x/${output}.png
    sh genlabelx2.ic
    mv foo.png 2x/${output}.png
  fi
done
