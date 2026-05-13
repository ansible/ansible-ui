#!/bin/bash
#
# Seed Deprecation Data Script
#
# This script runs test playbooks repeatedly to generate deprecation warnings
# for demonstration purposes. Run this over multiple days to build historical data.
#
# Usage:
#   ./seed_deprecation_data.sh [iterations] [delay_seconds]
#
# Examples:
#   ./seed_deprecation_data.sh 10 30    # Run 10 times, 30 seconds apart
#   ./seed_deprecation_data.sh 20 60    # Run 20 times, 1 minute apart
#

set -e

# Configuration
ITERATIONS=${1:-10}
DELAY=${2:-60}
AWX_HOST=${AWX_HOST:-"https://localhost:8043"}
AWX_USERNAME=${AWX_USERNAME:-"admin"}
AWX_PASSWORD=${AWX_PASSWORD:-"password"}

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Deprecation Data Seeding Script ===${NC}"
echo "Will run $ITERATIONS iterations with $DELAY second delays"
echo "AWX Host: $AWX_HOST"
echo ""

# Function to run a job template
run_job_template() {
    local template_name=$1
    local variation=$2

    echo -e "${YELLOW}Running: $template_name (variation $variation)${NC}"

    # Get template ID
    template_id=$(curl -ks -u "$AWX_USERNAME:$AWX_PASSWORD" \
        "$AWX_HOST/api/v2/job_templates/?name=$template_name" \
        | jq -r '.results[0].id')

    if [ "$template_id" = "null" ] || [ -z "$template_id" ]; then
        echo "Template not found: $template_name"
        return 1
    fi

    # Launch job
    job_id=$(curl -ks -u "$AWX_USERNAME:$AWX_PASSWORD" \
        -X POST "$AWX_HOST/api/v2/job_templates/$template_id/launch/" \
        -H "Content-Type: application/json" \
        | jq -r '.id')

    echo "  → Job $job_id launched"

    # Wait for job to complete
    while true; do
        status=$(curl -ks -u "$AWX_USERNAME:$AWX_PASSWORD" \
            "$AWX_HOST/api/v2/jobs/$job_id/" \
            | jq -r '.status')

        if [[ "$status" =~ ^(successful|failed|error|canceled)$ ]]; then
            echo "  → Job $job_id $status"
            break
        fi

        sleep 2
    done
}

# Create varied data by running different combinations
for i in $(seq 1 $ITERATIONS); do
    echo ""
    echo -e "${GREEN}=== Iteration $i of $ITERATIONS ===${NC}"

    # Vary which playbooks run to create different deprecation patterns
    case $((i % 3)) in
        0)
            # High deprecation count
            run_job_template "Test Deprecations - Aggressive" "$i"
            ;;
        1)
            # Medium deprecation count
            run_job_template "Test Deprecations" "$i"
            ;;
        2)
            # Low deprecation count (simulate fixes)
            run_job_template "Test Deprecations - Working" "$i"
            ;;
    esac

    # Don't delay after last iteration
    if [ $i -lt $ITERATIONS ]; then
        echo "Waiting $DELAY seconds before next iteration..."
        sleep $DELAY
    fi
done

echo ""
echo -e "${GREEN}=== Seeding Complete ===${NC}"
echo "Generated $ITERATIONS job runs with deprecation warnings"
echo "Refresh the deprecations dashboard to see the data"
