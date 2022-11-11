#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

if [[ -z "$1" ]]; then
    echo "Usage" 1>&2
    exit 1
fi
cat | 
  genson |
  jq '.items' |
  jq --arg title $1 '. + {title: $title}' |
  npx json2ts --style.singleQuote --no-style.semi --no-additionalProperties
