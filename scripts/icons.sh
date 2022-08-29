#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR/../frontend/icons
# convert -density 1920 -background none -resize 144x144 -border 24 -bordercolor transparent ansible.svg 192.png
# convert -density 2560 -background none -resize 192x192 -border 32 -bordercolor transparent ansible.svg 256.png
# convert -density 3840 -background none -resize 288x288 -border 48 -bordercolor transparent ansible.svg 384.png
# convert -density 5120 -background none -resize 384x384 -border 64 -bordercolor transparent ansible.svg 512.png
# convert -density 1920 -background none -resize 156x156 -border 18 -bordercolor transparent ansible.svg 192.png
# convert -density 2560 -background none -resize 208x208 -border 24 -bordercolor transparent ansible.svg 256.png
# convert -density 3840 -background none -resize 312x312 -border 36 -bordercolor transparent ansible.svg 384.png
# convert -density 5120 -background none -resize 416x416 -border 48 -bordercolor transparent ansible.svg 512.png
convert -density 1920 -background none -resize 168x168 -border 12 -bordercolor transparent ansible.svg 192.png
convert -density 2560 -background none -resize 224x224 -border 16 -bordercolor transparent ansible.svg 256.png
convert -density 3840 -background none -resize 336x336 -border 24 -bordercolor transparent ansible.svg 384.png
convert -density 5120 -background none -resize 448x448 -border 32 -bordercolor transparent ansible.svg 512.png

convert -density 960 -background none -resize 96x96 ansible.svg ansible.png
convert -density 480 -background none -resize 48x48 favicon.svg favicon.png

optipng -o7 ansible.png
optipng -o7 favicon.png
optipng -o7 192.png
optipng -o7 256.png
optipng -o7 384.png
optipng -o7 512.png