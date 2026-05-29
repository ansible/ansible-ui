#!/usr/bin/env python3
"""Classify test failures by age: NEW, RECURRING, or CHRONIC.

Reads a JSON file of test performance data (from Currents
currents-get-tests-performance) and an optional JSON file of
per-test execution results (from currents-get-test-results),
then classifies each failure deterministically.

Key improvement over instruction-based classification: detects
regression patterns where a test was passing consistently and
then started failing recently (was-passing-now-failing = NEW,
even if the aggregate failure rate looks like RECURRING).

Usage:
    python3 classify_failures.py \
        --performance performance.json \
        --results results/ \
        --failures failure-titles.json \
        --output classified.json

Inputs:
    --performance: JSON from currents-get-tests-performance API
    --results:     Directory of per-test result files (optional,
                   enables regression detection)
    --failures:    JSON array of test titles that failed today
    --output:      Path to write classified output

Output (classified.json):
    {
        "classifications": {
            "test title": {
                "age": "NEW|RECURRING|CHRONIC",
                "failure_rate": 0.15,
                "executions": 20,
                "failures": 3,
                "regression_detected": true,
                "reason": "Was passing days 1-5, started failing days 6-7"
            }
        },
        "summary": {
            "new": 2,
            "recurring": 5,
            "chronic": 10,
            "total": 17
        }
    }
"""

import argparse
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

log = logging.getLogger("classify_failures")


def load_json(path):
    p = Path(path)
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text())
    except (json.JSONDecodeError, OSError) as exc:
        log.warning("Failed to load %s: %s", p, exc)
        return None


def build_performance_map(perf_data):
    """Build lookup from test title to metrics.

    Handles both raw API response and pre-extracted list formats.
    """
    if not perf_data:
        return {}

    items = perf_data
    if isinstance(perf_data, dict):
        items = perf_data.get("data", {}).get("list", [])

    result = {}
    for item in items:
        title = item.get("title", "")
        metrics = item.get("metrics", {})
        result[title] = {
            "failure_rate": metrics.get("failureRate", 0),
            "executions": metrics.get("executions", 0),
            "failures": metrics.get("failures", 0),
            "signature": item.get("signature", ""),
        }
    return result


def check_regression_pattern(results_data):
    """Check if test results show a was-passing-now-failing pattern.

    Splits execution results into first half and second half of
    the time window. If first half has near-zero failures and
    second half has 2+ failures, this is a regression.

    Returns (is_regression, reason_string).
    """
    if not results_data:
        return False, ""

    executions = results_data
    if isinstance(results_data, dict):
        executions = results_data.get("data", [])

    if not executions or len(executions) < 3:
        return False, ""

    sorted_execs = sorted(executions, key=lambda e: e.get("createdAt", ""))

    midpoint = len(sorted_execs) // 2
    first_half = sorted_execs[:midpoint]
    second_half = sorted_execs[midpoint:]

    first_failures = sum(1 for e in first_half if e.get("status") == "failed")
    second_failures = sum(1 for e in second_half if e.get("status") == "failed")

    first_total = len(first_half)
    first_rate = first_failures / first_total if first_total > 0 else 0

    if first_rate < 0.10 and second_failures >= 2:
        first_dates = [e.get("createdAt", "?")[:10] for e in first_half]
        second_dates = [e.get("createdAt", "?")[:10] for e in second_half]
        first_range = f"{first_dates[0]} to {first_dates[-1]}" if first_dates else "?"
        second_range = f"{second_dates[0]} to {second_dates[-1]}" if second_dates else "?"
        reason = (
            f"Was passing {first_range} ({first_failures}/{first_total} failures), "
            f"started failing {second_range} ({second_failures}/{len(second_half)} failures)"
        )
        return True, reason

    return False, ""


def classify_age(title, perf_map, results_dir=None):
    """Classify a single test failure by age.

    Returns a dict with age, metrics, and reasoning.
    """
    entry = perf_map.get(title)

    if entry is None:
        for perf_title, data in perf_map.items():
            if title in perf_title or perf_title in title:
                entry = data
                break

    if entry is None:
        return {
            "age": "RECURRING",
            "failure_rate": 0,
            "executions": 0,
            "failures": 0,
            "regression_detected": False,
            "reason": "Not found in top-50 performance data — defaults to RECURRING",
        }

    rate = entry["failure_rate"]
    executions = entry["executions"]
    failures = entry["failures"]
    signature = entry.get("signature", "")

    base = {
        "failure_rate": rate,
        "executions": executions,
        "failures": failures,
        "regression_detected": False,
    }

    if executions < 5 and rate > 0.5:
        return {**base, "age": "NEW", "reason": f"Few executions ({executions}) with high failure rate ({rate:.0%})"}

    if rate < 0.05 and failures < 2:
        return {**base, "age": "NEW", "reason": f"Very low failure rate ({rate:.1%}) with {failures} failure(s)"}

    if 0.05 <= rate <= 0.50 and results_dir and signature:
        results_file = Path(results_dir) / f"{signature}.json"
        results_data = load_json(results_file)
        if results_data:
            is_regression, reason = check_regression_pattern(results_data)
            if is_regression:
                return {
                    **base,
                    "age": "NEW",
                    "regression_detected": True,
                    "reason": reason,
                }

    if rate > 0.85 and executions >= 10:
        return {**base, "age": "CHRONIC", "reason": f"High failure rate ({rate:.0%}) over {executions} executions"}

    if rate >= 0.05:
        return {**base, "age": "RECURRING", "reason": f"Failure rate {rate:.0%} over {executions} executions"}

    return {**base, "age": "NEW", "reason": f"Low failure rate ({rate:.1%})"}


def main():
    parser = argparse.ArgumentParser(description="Classify test failures by age")
    parser.add_argument("--performance", required=True,
                        help="Path to currents-get-tests-performance JSON")
    parser.add_argument("--results", default=None,
                        help="Directory of per-test currents-get-test-results JSON files (optional)")
    parser.add_argument("--failures", required=True,
                        help="Path to JSON array of test titles that failed today")
    parser.add_argument("--output", required=True,
                        help="Output path for classified.json")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    perf_data = load_json(args.performance)
    if perf_data is None:
        log.error("Could not load performance data: %s", args.performance)
        sys.exit(1)

    failure_titles = load_json(args.failures)
    if failure_titles is None:
        log.error("Could not load failure titles: %s", args.failures)
        sys.exit(1)

    perf_map = build_performance_map(perf_data)

    classifications = {}
    counts = {"new": 0, "recurring": 0, "chronic": 0}

    for title in failure_titles:
        result = classify_age(title, perf_map, results_dir=args.results)
        classifications[title] = result
        age_key = result["age"].lower()
        if age_key in counts:
            counts[age_key] += 1

    output = {
        "classifications": classifications,
        "summary": {
            **counts,
            "total": len(classifications),
        },
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, indent=2))
    log.info("Wrote %s (%d classified: %d NEW, %d RECURRING, %d CHRONIC)",
             output_path, len(classifications),
             counts["new"], counts["recurring"], counts["chronic"])

    print(json.dumps(output["summary"]))


if __name__ == "__main__":
    main()
