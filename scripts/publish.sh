#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR/..

npm run build:mjs
npm run build:cjs
cd publish
VERSION=`cat ../package.json | jq -r '.version'` && cat package.json | jq --arg version $VERSION '. +{version: $version}' > temp.json
rm -f package.json
mv temp.json package.json
npm publish --dry-run