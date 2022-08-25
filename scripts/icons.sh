#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR/../frontend/icons
convert -density 1920 -background none -resize 144x144 -border 24 -bordercolor transparent ansible.svg 192.png
convert -density 5120 -background none -resize 384x384 -border 64 -bordercolor transparent ansible.svg 512.png
convert -density 960 -background none -resize 96x96 ansible.svg ansible.png
convert -density 480 -background none -resize 48x48 favicon.svg favicon.png