#!/usr/bin/env bash

check_vars() {
    # Variable validation.
    #
    # Args: ($@) - 1 or many variable(s) to check
    #
    local _var_names=("$@")

    for var_name in "${_var_names[@]}"; do
        if  [[ -z "$var_name" ]]; then
          log-debug "${var_name}=${!var_name}"
        else
          log-err "Environment variable $var_name is not set! Unable to continue."
          exit 1
        fi
    done
}
