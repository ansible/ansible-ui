#!/bin/bash

# Playwright MCP Launcher with Chrome to Chromium fallback
# This script tries to launch Playwright MCP with Chrome browser first.
# If Chrome is not available or fails, it falls back to Chromium.

# Try Chrome first, fallback to Chromium if it fails
npx -y @playwright/mcp@0.0.80 --browser chrome 2>/dev/null || \
npx -y @playwright/mcp@0.0.80 --browser chromium
