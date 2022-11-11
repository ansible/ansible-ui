#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

if [[ -z "$SERVER" ]]; then
    echo "Usage" 1>&2
    exit 1
fi

if [[ -z "$TOKEN" ]]; then
    echo "Usage" 1>&2
    exit 1
fi

if [[ -z "$1" ]]; then
    echo "Usage" 1>&2
    exit 1
fi

if [[ -z "$2" ]]; then
    echo "Usage" 1>&2
    exit 1
fi

if [[ -z "$3" ]]; then
    echo "Usage" 1>&2
    exit 1
fi

curl -q -k -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" ${SERVER}${2} |
  jq ${3} |
  ./array2ts.sh ${1} > ${4}
