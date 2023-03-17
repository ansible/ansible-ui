#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR/../frontend/icons
# convert -density 1920 -background none -resize 144x144 -border 24 -bordercolor transparent brand-logo.svg 192.png
# convert -density 2560 -background none -resize 192x192 -border 32 -bordercolor transparent brand-logo.svg 256.png
# convert -density 3840 -background none -resize 288x288 -border 48 -bordercolor transparent brand-logo.svg 384.png
# convert -density 5120 -background none -resize 384x384 -border 64 -bordercolor transparent brand-logo.svg 512.png
# convert -density 1920 -background none -resize 156x156 -border 18 -bordercolor transparent brand-logo.svg 192.png
# convert -density 2560 -background none -resize 208x208 -border 24 -bordercolor transparent brand-logo.svg 256.png
# convert -density 3840 -background none -resize 312x312 -border 36 -bordercolor transparent brand-logo.svg 384.png
# convert -density 5120 -background none -resize 416x416 -border 48 -bordercolor transparent brand-logo.svg 512.png
convert -density 1920 -background "#00000000" -resize 168x168 -border 12 -bordercolor "#00000000" brand-logo.svg 192.png
convert -density 2560 -background "#00000000" -resize 224x224 -border 16 -bordercolor "#00000000" brand-logo.svg 256.png
convert -density 3840 -background "#00000000" -resize 336x336 -border 24 -bordercolor "#00000000" brand-logo.svg 384.png
convert -density 5120 -background "#00000000" -resize 448x448 -border 32 -bordercolor "#00000000" brand-logo.svg 512.png

convert -density 1920 -background "#00000000" -resize 192x192 brand-logo.svg brand-logo.png
convert -density 480 -background "#00000000" -resize 48x48 favicon.svg favicon.png

# iOS requires an 'apple-touch-icon' non-transparent 192px
convert -density 1920 -background "#000000" -resize 192x192 brand-logo.svg brand-logo192.png

optipng -o7 brand-logo.png
optipng -o7 favicon.png
optipng -o7 192.png
optipng -o7 256.png
optipng -o7 384.png
optipng -o7 512.png
