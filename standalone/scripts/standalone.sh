#!/usr/bin/env bash
set -o errexit
set -o pipefail
set -o nounset

SCRIPTS_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT_DIR="${SCRIPTS_DIR}/../.."

CMD=${1:-help}
VERSION=${2:-'eda-latest'}

export DEBUG=${DEBUG:-false}

# import common & logging
source "${SCRIPTS_DIR}"/common/logging.sh

trap handle_errors ERR

handle_errors() {
  log-err "An error occurred on or around line ${BASH_LINENO[0]}. Unable to continue."
  exit 1
}

usage() {
    log-info "Usage: $(basename "$0") <command> [command_arg]"
    log-info ""
    log-info "commands:"
    log-info "\t build-eda <version>           build EDA stand-alone 2.4 UI"
    log-info "\t help                          show usage"
}

help() {
    usage
}

build-eda() {
  local _image="ansible-ui:${1}"

  cd "${PROJECT_DIR}"
  log-info "docker build . -t ${_image} -f standalone/eda/nginx/Dockerfile"
  docker build . -t "${_image}" -f standalone/eda/nginx/Dockerfile
}

#
# execute
#
log-debug "COMMAND: ${CMD}"
log-debug "VERSION: ${VERSION}"

case ${CMD} in
  "build-eda") build-eda "${VERSION}" ;;
  "help") usage ;;
   *) usage ;;
esac
