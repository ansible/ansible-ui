#!/usr/bin/env python3
"""
Sync a SonarCloud quality profile from the ansible org to ansible-automation-platform.

Uses backup/restore plus a reconcile pass so deactivations on the source profile
are applied on the target (restore alone may not turn off extra rules on the target).

Requires SONARCLOUD_TOKEN with Administer Quality Profiles on both organizations.

Example (TypeScript aap-ui-special → AAP UI):

  export SONARCLOUD_TOKEN='…'
  python3 scripts/sync-sonar-quality-profile.py \\
    --language ts \\
    --source-profile aap-ui-special \\
    --target-profile 'AAP UI'

Dry run (no restore/deactivate writes):

  python3 scripts/sync-sonar-quality-profile.py --language ts --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from base64 import b64encode

BASE = os.environ.get("SONAR_BASE_URL", "https://sonarcloud.io/api").rstrip("/")
SOURCE_ORG = os.environ.get("SONAR_SOURCE_ORGANIZATION", "ansible")
TARGET_ORG = os.environ.get("SONAR_TARGET_ORGANIZATION", "ansible-automation-platform")
PAGE_SIZE = 500


def token() -> str:
    value = os.environ.get("SONARCLOUD_TOKEN", "").strip()
    if not value:
        print("Set SONARCLOUD_TOKEN (user token with both org permissions).", file=sys.stderr)
        sys.exit(1)
    return value


def request(
    method: str,
    path: str,
    params: dict[str, str] | None = None,
    data: bytes | None = None,
    content_type: str | None = None,
) -> bytes:
    query = ""
    if params:
        query = "?" + urllib.parse.urlencode(params)
    url = f"{BASE}{path}{query}"
    headers = {
        "Accept": "application/json",
        "User-Agent": "sync-sonar-quality-profile/1.0",
        "Authorization": f"Basic {b64encode(f'{token()}:'.encode()).decode()}",
    }
    if content_type:
        headers["Content-Type"] = content_type
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=120, context=ctx) as resp:
            return resp.read()
    except urllib.error.HTTPError as exc:
        body = exc.read().decode(errors="replace")
        print(f"HTTP {exc.code} {method} {path}\n{body}", file=sys.stderr)
        raise


def profile_key(org: str, language: str, name: str) -> str:
    data = json.loads(
        request(
            "GET",
            "/qualityprofiles/search",
            {"organization": org, "language": language, "qualityProfile": name},
        ).decode()
    )
    for profile in data.get("profiles", []):
        if profile.get("name") == name and profile.get("language") == language:
            return profile["key"]
    raise SystemExit(f"Profile not found: {org} / {language} / {name}")


def backup_profile(org: str, language: str, name: str) -> bytes:
    key = profile_key(org, language, name)
    query = urllib.parse.urlencode(
        {"organization": org, "language": language, "key": key, "qualityProfile": name}
    )
    url = f"{BASE}/qualityprofiles/backup?{query}"
    headers = {
        "Authorization": f"Basic {b64encode(f'{token()}:'.encode()).decode()}",
        "User-Agent": "sync-sonar-quality-profile/1.0",
    }
    req = urllib.request.Request(url, headers=headers)
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=120, context=ctx) as resp:
        return resp.read()


def restore_profile(org: str, backup_xml: bytes) -> None:
    boundary = "----sonar-profile-sync"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="organization"\r\n\r\n'
        f"{org}\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="backup"; filename="profile.xml"\r\n'
        f"Content-Type: application/xml\r\n\r\n"
    ).encode() + backup_xml + f"\r\n--{boundary}--\r\n".encode()
    url = f"{BASE}/qualityprofiles/restore"
    headers = {
        "Authorization": f"Basic {b64encode(f'{token()}:'.encode()).decode()}",
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "User-Agent": "sync-sonar-quality-profile/1.0",
    }
    req = urllib.request.Request(url, data=body, method="POST", headers=headers)
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=120, context=ctx) as resp:
        print(resp.read().decode(errors="replace"))


def rule_keys(org: str, profile: str, language: str, activation: str) -> set[str]:
    keys: set[str] = set()
    page = 1
    while True:
        params = {
            "organization": org,
            "qprofile": profile,
            "activation": activation,
            "ps": str(PAGE_SIZE),
            "p": str(page),
        }
        data = json.loads(request("GET", "/rules/search", params).decode())
        for rule in data.get("rules", []):
            keys.add(rule["key"])
        total = data.get("total", 0)
        if page * PAGE_SIZE >= total:
            break
        page += 1
    return keys


def deactivate_rule(org: str, profile_name: str, language: str, rule_key: str) -> None:
    params = {
        "organization": org,
        "profileName": profile_name,
        "language": language,
        "ruleKey": rule_key,
    }
    request("POST", "/qualityprofiles/deactivate_rule", params)


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync SonarCloud quality profile across orgs")
    parser.add_argument("--language", required=True, help="Profile language, e.g. ts or js")
    parser.add_argument("--source-profile", default="aap-ui-special")
    parser.add_argument("--target-profile", default="AAP UI")
    parser.add_argument("--source-org", default=SOURCE_ORG)
    parser.add_argument("--target-org", default=TARGET_ORG)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only print reconcile diff; do not restore or deactivate",
    )
    parser.add_argument(
        "--skip-restore",
        action="store_true",
        help="Only run inactive-rule reconcile on target",
    )
    parser.add_argument(
        "--save-backup",
        metavar="FILE",
        help="Write source profile XML to this path",
    )
    args = parser.parse_args()

    print(f"Source: {args.source_org} / {args.language} / {args.source_profile}")
    print(f"Target: {args.target_org} / {args.language} / {args.target_profile}")

    backup = backup_profile(args.source_org, args.language, args.source_profile)
    print(f"Backed up source profile ({len(backup)} bytes XML)")
    if args.save_backup:
        with open(args.save_backup, "wb") as handle:
            handle.write(backup)
        print(f"Wrote {args.save_backup}")

    if not args.skip_restore and not args.dry_run:
        print(
            f"Restoring into org {args.target_org} "
            "(profile name comes from the XML, usually 'aap-ui-special')…"
        )
        restore_profile(args.target_org, backup)
        print(
            "After restore: assign project aap-ui to the restored profile in Sonar UI "
            "(or retire 'AAP UI' if you standardize on aap-ui-special)."
        )

    source_key = profile_key(args.source_org, args.language, args.source_profile)
    target_key = profile_key(args.target_org, args.language, args.target_profile)

    source_inactive = rule_keys(args.source_org, source_key, args.language, "INACTIVE")
    target_active = rule_keys(args.target_org, target_key, args.language, "ACTIVE")

    to_deactivate = sorted(target_active & source_inactive)
    print(f"Rules active on target but inactive on source: {len(to_deactivate)}")
    if to_deactivate[:10]:
        print("  Examples:", ", ".join(to_deactivate[:10]))

    if args.dry_run:
        return 0

    for rule in to_deactivate:
        deactivate_rule(args.target_org, args.target_profile, args.language, rule)
    print(f"Deactivated {len(to_deactivate)} rules on {args.target_profile}")

    print(
        "Done. Assign the target profile to project aap-ui in Sonar UI if needed, "
        "then re-run analysis on a backport PR."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
