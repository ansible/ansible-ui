#!/usr/bin/env python3
"""
Compare SonarCloud quality gates and quality profiles between upstream
(ansible-ui) and downstream (aap-ui) projects.

Requires SONARCLOUD_TOKEN with access to both organizations.

Environment:
  SONARCLOUD_TOKEN (required)
  SONAR_UPSTREAM_ORGANIZATION (default: ansible)
  SONAR_UPSTREAM_PROJECT_KEY (default: ansible_ansible-ui)
  SONAR_DOWNSTREAM_ORGANIZATION (default: ansible-automation-platform)
  SONAR_DOWNSTREAM_PROJECT_KEY (default: ansible-automation-platform_aap-ui)
  SONAR_BASE_URL (default: https://sonarcloud.io/api)
"""

from __future__ import annotations

import json
import os
import ssl
import sys
import urllib.error
import urllib.request
from base64 import b64encode
from urllib.parse import quote

BASE_URL = os.environ.get("SONAR_BASE_URL", "https://sonarcloud.io/api").rstrip("/")
LANGUAGES = ("ts", "js")


def auth_headers() -> dict[str, str]:
    token = os.environ.get("SONARCLOUD_TOKEN", "").strip()
    if not token:
        return {}
    encoded = b64encode(f"{token}:".encode()).decode()
    return {"Authorization": f"Basic {encoded}"}


def get_json(path: str, params: dict[str, str] | None = None) -> dict:
    query = ""
    if params:
        query = "?" + "&".join(f"{quote(k, safe='')}={quote(v, safe='')}" for k, v in params.items())
    url = f"{BASE_URL}{path}{query}"
    headers = {"Accept": "application/json", "User-Agent": "compare-sonarcloud-projects/1.0"}
    headers.update(auth_headers())
    req = urllib.request.Request(url, headers=headers)
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=60, context=ctx) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode(errors="replace")
        print(f"HTTP {exc.code} for {url}\n{body}", file=sys.stderr)
        raise


def project_gate(org: str, project_key: str) -> dict:
    return get_json(
        "/qualitygates/get_by_project",
        {"organization": org, "project": project_key},
    )


def list_profiles(org: str, project_key: str) -> list[dict]:
    data = get_json(
        "/qualityprofiles/search",
        {"organization": org, "project": project_key},
    )
    return data.get("profiles", [])


def profile_for_language(profiles: list[dict], language: str) -> dict | None:
    matches = [p for p in profiles if p.get("language") == language and p.get("isInherited") is not True]
    if not matches:
        matches = [p for p in profiles if p.get("language") == language]
    if not matches:
        return None
    defaults = [p for p in matches if p.get("isDefault")]
    return defaults[0] if defaults else matches[0]


def compare_profiles(left_key: str, right_key: str, org: str) -> dict:
    return get_json(
        "/qualityprofiles/compare",
        {"leftKey": left_key, "rightKey": right_key, "organization": org},
    )


def summarize_diff(compare: dict) -> tuple[list[str], list[str], list[str]]:
    inactive = []
    active = []
    modified = []
    for rule in compare.get("inactivations", []):
        inactive.append(rule.get("ruleKey", ""))
    for rule in compare.get("activations", []):
        active.append(rule.get("ruleKey", ""))
    for rule in compare.get("modifications", []):
        modified.append(rule.get("ruleKey", ""))
    return inactive, active, modified


def print_project(label: str, org: str, project_key: str) -> None:
    print(f"\n=== {label} ({org} / {project_key}) ===")
    try:
        gate = project_gate(org, project_key)
        qg = gate.get("qualityGate", {})
        print(f"Quality gate: {qg.get('name', '(unknown)')}")
    except urllib.error.HTTPError:
        print("Quality gate: (could not fetch — check token/org access)")

    profiles = list_profiles(org, project_key)
    for lang in LANGUAGES:
        prof = profile_for_language(profiles, lang)
        if prof:
            print(
                f"  {lang}: {prof.get('name')} (key={prof.get('key')}, "
                f"default={prof.get('isDefault')})"
            )
        else:
            print(f"  {lang}: (no profile found)")


def main() -> int:
    token = os.environ.get("SONARCLOUD_TOKEN", "").strip()
    if not token:
        print("Set SONARCLOUD_TOKEN to a user token with both org memberships.", file=sys.stderr)
        return 1

    up_org = os.environ.get("SONAR_UPSTREAM_ORGANIZATION", "ansible")
    up_key = os.environ.get("SONAR_UPSTREAM_PROJECT_KEY", "ansible_ansible-ui")
    down_org = os.environ.get("SONAR_DOWNSTREAM_ORGANIZATION", "ansible-automation-platform")
    down_key = os.environ.get("SONAR_DOWNSTREAM_PROJECT_KEY", "ansible-automation-platform_aap-ui")

    print("SonarCloud dual-project comparison")
    print_project("Upstream (ansible-ui)", up_org, up_key)
    print_project("Downstream (aap-ui)", down_org, down_key)

    up_profiles = list_profiles(up_org, up_key)
    down_profiles = list_profiles(down_org, down_key)

    print("\n=== Profile rule diffs (upstream → downstream) ===")
    for lang in LANGUAGES:
        left = profile_for_language(up_profiles, lang)
        right = profile_for_language(down_profiles, lang)
        if not left or not right:
            print(f"{lang}: skip (missing profile on one side)")
            continue
        if left["key"] == right["key"]:
            print(f"{lang}: same profile key (unexpected across orgs)")
            continue
        try:
            compare = compare_profiles(left["key"], right["key"], up_org)
        except urllib.error.HTTPError:
            try:
                compare = compare_profiles(left["key"], right["key"], down_org)
            except urllib.error.HTTPError as exc:
                print(f"{lang}: compare API failed ({exc.code})")
                continue

        inactive, active, modified = summarize_diff(compare)
        print(f"\n{lang}: left={left['name']} vs right={right['name']}")
        if inactive:
            print(f"  Rules active upstream only ({len(inactive)}): {', '.join(inactive[:8])}")
            if len(inactive) > 8:
                print(f"    … and {len(inactive) - 8} more")
        if active:
            print(f"  Rules active downstream only ({len(active)}): {', '.join(active[:8])}")
            if len(active) > 8:
                print(f"    … and {len(active) - 8} more")
        if modified:
            print(f"  Rules with different severity/params ({len(modified)}): {', '.join(modified[:8])}")
        if not inactive and not active and not modified:
            print("  No rule differences reported by compare API.")

    print("\nNext: align downstream gate + profiles in SonarCloud UI (see docs/dev/sonarcloud-dual-project-sync.md).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
