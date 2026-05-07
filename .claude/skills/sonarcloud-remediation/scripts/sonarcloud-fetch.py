#!/usr/bin/env python3
"""
Fetch SonarCloud issues, hotspots, and duplication metrics.

Reads SONAR_PROJECT_KEY, SONAR_ORGANIZATION, and optionally
SONARCLOUD_TOKEN from environment variables. Outputs categorized
JSON to stdout. Diagnostics go to stderr.

Usage:
    python3 sonarcloud-fetch.py
"""

import json
import math
import os
import ssl
import sys
import urllib.error
import urllib.request
from base64 import b64encode
from datetime import datetime, timezone

BASE_URL = "https://sonarcloud.io/api"
PAGE_SIZE = 500
MAX_RESULTS = 10000
DUPLICATION_RULE_SUFFIXES = {"S1192"}


def _build_auth_header():
    token = os.environ.get("SONARCLOUD_TOKEN", "").strip()
    if not token:
        return {}
    encoded = b64encode(f"{token}:".encode()).decode()
    return {"Authorization": f"Basic {encoded}"}


def _build_ssl_context():
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        ctx = ssl.create_default_context()
        try:
            urllib.request.urlopen("https://sonarcloud.io", timeout=5, context=ctx)
        except (urllib.error.URLError, ssl.SSLError):
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
        return ctx


def _request(url, ssl_ctx):
    headers = {"Accept": "application/json", "User-Agent": "sonarcloud-fetch/1.0"}
    headers.update(_build_auth_header())
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30, context=ssl_ctx) as resp:
        return json.loads(resp.read().decode())


def _get_total(data):
    paging = data.get("paging", {})
    if paging and "total" in paging:
        return paging["total"]
    return data.get("total", 0)


def _strip_prefix(component, project_key):
    prefix = project_key + ":"
    if component.startswith(prefix):
        return component[len(prefix):]
    return component


def _rule_suffix(rule):
    if ":" in rule:
        return rule.split(":", 1)[1]
    return rule


def fetch_issues(project_key, ssl_ctx):
    items = []
    page = 1
    total = None

    while True:
        url = f"{BASE_URL}/issues/search?componentKeys={project_key}&resolved=false&ps={PAGE_SIZE}&p={page}"
        data = _request(url, ssl_ctx)

        if total is None:
            total = _get_total(data)
            print(f"Issues: {total} total", file=sys.stderr)

        for issue in data.get("issues", []):
            items.append({
                "key": issue.get("key", ""),
                "component": _strip_prefix(issue.get("component", ""), project_key),
                "type": issue.get("type", ""),
                "severity": issue.get("severity", ""),
                "line": issue.get("line"),
                "message": issue.get("message", ""),
                "rule": issue.get("rule", ""),
            })

        fetched = page * PAGE_SIZE
        if fetched >= total or fetched >= MAX_RESULTS:
            if total > MAX_RESULTS:
                print(
                    f"Warning: SonarCloud API limits results to {MAX_RESULTS}. "
                    "Use severity/type filters for complete data.",
                    file=sys.stderr,
                )
            break

        page += 1
        print(f"Fetching issues page {page}/{math.ceil(min(total, MAX_RESULTS) / PAGE_SIZE)}...", file=sys.stderr)

    return {"total": total, "items": items}


def fetch_hotspots(project_key, ssl_ctx):
    items = []
    page = 1
    total = None

    while True:
        url = f"{BASE_URL}/hotspots/search?projectKey={project_key}&status=TO_REVIEW&ps={PAGE_SIZE}&p={page}"
        data = _request(url, ssl_ctx)

        if total is None:
            total = _get_total(data)
            print(f"Hotspots: {total} total", file=sys.stderr)

        for hotspot in data.get("hotspots", []):
            items.append({
                "key": hotspot.get("key", ""),
                "component": _strip_prefix(hotspot.get("component", ""), project_key),
                "securityCategory": hotspot.get("securityCategory", ""),
                "vulnerabilityProbability": hotspot.get("vulnerabilityProbability", ""),
                "line": hotspot.get("line"),
                "message": hotspot.get("message", ""),
                "rule": hotspot.get("ruleKey", ""),
                "status": hotspot.get("status", ""),
            })

        fetched = page * PAGE_SIZE
        if fetched >= total or fetched >= MAX_RESULTS:
            break

        page += 1
        print(f"Fetching hotspots page {page}/{math.ceil(min(total, MAX_RESULTS) / PAGE_SIZE)}...", file=sys.stderr)

    return {"total": total, "items": items}


def fetch_duplication(project_key, ssl_ctx):
    url = (
        f"{BASE_URL}/measures/component?component={project_key}"
        "&metricKeys=duplicated_lines_density,duplicated_blocks,duplicated_files"
    )
    data = _request(url, ssl_ctx)

    result = {
        "duplicated_lines_density": None,
        "duplicated_blocks": None,
        "duplicated_files": None,
    }

    for measure in data.get("component", {}).get("measures", []):
        metric = measure.get("metric", "")
        value = measure.get("value")
        if metric in result and value is not None:
            try:
                result[metric] = float(value) if "." in str(value) else int(value)
            except (ValueError, TypeError):
                result[metric] = value

    return result


def categorize(issues_items, hotspots_items):
    categories = {
        "Security": [],
        "Reliability": [],
        "Maintainability": [],
        "Security Hotspots": list(hotspots_items),
        "Duplication": [],
    }

    for issue in issues_items:
        issue_type = issue.get("type", "")
        suffix = _rule_suffix(issue.get("rule", ""))

        if issue_type == "VULNERABILITY":
            categories["Security"].append(issue)
        elif issue_type == "BUG":
            categories["Reliability"].append(issue)
        elif issue_type == "CODE_SMELL":
            categories["Maintainability"].append(issue)
            if suffix in DUPLICATION_RULE_SUFFIXES:
                categories["Duplication"].append(issue)

    return categories


def main():
    project_key = os.environ.get("SONAR_PROJECT_KEY", "").strip()
    organization = os.environ.get("SONAR_ORGANIZATION", "").strip()

    if not project_key or not organization:
        error = {
            "error": "SONAR_PROJECT_KEY and SONAR_ORGANIZATION environment variables are required.",
        }
        print(json.dumps(error, indent=2))
        print("ERROR: Set SONAR_PROJECT_KEY and SONAR_ORGANIZATION before running.", file=sys.stderr)
        sys.exit(1)

    ssl_ctx = _build_ssl_context()

    try:
        print(f"Fetching SonarCloud data for {project_key}...", file=sys.stderr)
        issues = fetch_issues(project_key, ssl_ctx)
        hotspots = fetch_hotspots(project_key, ssl_ctx)
        duplication = fetch_duplication(project_key, ssl_ctx)
    except urllib.error.HTTPError as e:
        messages = {
            401: "Authentication failed (HTTP 401). Check SONARCLOUD_TOKEN.",
            403: "Access forbidden (HTTP 403). Token may lack permissions or project key may be wrong.",
            404: "Project not found (HTTP 404). Verify SONAR_PROJECT_KEY.",
        }
        msg = messages.get(e.code, f"HTTP error {e.code}: {e.reason}")
        print(json.dumps({"error": msg}, indent=2))
        print(f"ERROR: {msg}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        msg = f"Connection error: {e.reason}"
        print(json.dumps({"error": msg}, indent=2))
        print(f"ERROR: {msg}", file=sys.stderr)
        sys.exit(1)

    categories = categorize(issues["items"], hotspots["items"])

    result = {
        "project_key": project_key,
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "issues": issues,
        "hotspots": hotspots,
        "duplication": duplication,
        "categories": categories,
    }

    print(json.dumps(result, indent=2))
    print(
        f"Done: {issues['total']} issues, {hotspots['total']} hotspots, "
        f"{duplication.get('duplicated_blocks', 0) or 0} duplicated blocks",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
