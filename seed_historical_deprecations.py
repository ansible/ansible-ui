#!/usr/bin/env python3
"""
Seed Historical Deprecation Data

This script generates deprecation data with simulated historical timestamps.
Two modes:
  1. API-only: Creates real jobs now (no historical spread)
  2. Database mode: Backdates job timestamps (requires PostgreSQL access)

Usage:
  # API mode (creates jobs right now)
  ./seed_historical_deprecations.py --mode api --days 30 --jobs-per-day 5

  # Database mode (backdates timestamps - REQUIRES DB ACCESS)
  ./seed_historical_deprecations.py --mode database --days 30 --jobs-per-day 5 \
      --db-host localhost --db-name awx --db-user awx --db-password awx
"""

import argparse
import json
import requests
import urllib3
from datetime import datetime, timedelta
import time
import sys

# Disable SSL warnings for local development
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class AWXSeeder:
    def __init__(self, host, username, password):
        self.host = host.rstrip('/')
        self.username = username
        self.password = password
        self.session = requests.Session()
        self.session.auth = (username, password)
        self.session.verify = False
        self.session.headers.update({'Content-Type': 'application/json'})

    def get_template_id(self, template_name):
        """Get job template ID by name"""
        resp = self.session.get(
            f'{self.host}/api/v2/job_templates/',
            params={'name': template_name}
        )
        resp.raise_for_status()
        results = resp.json().get('results', [])
        if not results:
            raise ValueError(f'Template not found: {template_name}')
        return results[0]['id']

    def launch_job(self, template_name):
        """Launch a job template and return job ID"""
        template_id = self.get_template_id(template_name)
        resp = self.session.post(
            f'{self.host}/api/v2/job_templates/{template_id}/launch/'
        )
        resp.raise_for_status()
        job_id = resp.json()['id']
        print(f'  ✓ Launched job {job_id} from template "{template_name}"')
        return job_id

    def wait_for_job(self, job_id, timeout=300):
        """Wait for job to complete"""
        start = time.time()
        while time.time() - start < timeout:
            resp = self.session.get(f'{self.host}/api/v2/jobs/{job_id}/')
            resp.raise_for_status()
            status = resp.json()['status']

            if status in ('successful', 'failed', 'error', 'canceled'):
                print(f'  ✓ Job {job_id} {status}')
                return status

            time.sleep(2)

        raise TimeoutError(f'Job {job_id} did not complete within {timeout}s')


class DatabaseBackdater:
    """Backdate job timestamps in PostgreSQL (requires database access)"""

    def __init__(self, db_host, db_name, db_user, db_password, db_port=5432):
        try:
            import psycopg2
            self.psycopg2 = psycopg2
        except ImportError:
            print('ERROR: psycopg2 not installed. Install with: pip install psycopg2-binary')
            sys.exit(1)

        self.conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password,
            port=db_port
        )

    def backdate_job(self, job_id, created_date):
        """Update job created/started/finished timestamps"""
        cursor = self.conn.cursor()

        # Update main_job table
        finished_date = created_date + timedelta(minutes=2)
        cursor.execute("""
            UPDATE main_job
            SET created = %s,
                started = %s,
                finished = %s,
                modified = %s
            WHERE id = %s
        """, (created_date, created_date, finished_date, finished_date, job_id))

        # Update main_jobevent table (deprecation events)
        cursor.execute("""
            UPDATE main_jobevent
            SET created = %s,
                modified = %s
            WHERE job_id = %s
        """, (created_date, finished_date, job_id))

        self.conn.commit()
        print(f'  ✓ Backdated job {job_id} to {created_date.date()}')

    def close(self):
        self.conn.close()


def generate_deprecation_pattern(day_offset, total_days):
    """
    Generate deprecation count for a given day.
    Simulates: high deprecations early, decreasing over time (fixes being applied)
    """
    # Start high, decrease over time with some randomness
    import random
    progress = day_offset / total_days
    base_count = int(50 * (1 - progress))  # 50 → 0
    variation = random.randint(-5, 5)
    return max(1, base_count + variation)


def main():
    parser = argparse.ArgumentParser(description='Seed historical deprecation data')
    parser.add_argument('--mode', choices=['api', 'database'], required=True,
                        help='api: create jobs now | database: backdate timestamps')
    parser.add_argument('--days', type=int, default=30,
                        help='Number of days of historical data (default: 30)')
    parser.add_argument('--jobs-per-day', type=int, default=3,
                        help='Jobs to create per day (default: 3)')
    parser.add_argument('--awx-host', default='https://localhost:8043',
                        help='AWX host URL')
    parser.add_argument('--awx-user', default='admin',
                        help='AWX username')
    parser.add_argument('--awx-password', default='password',
                        help='AWX password')

    # Database mode options
    parser.add_argument('--db-host', default='localhost',
                        help='PostgreSQL host (database mode only)')
    parser.add_argument('--db-name', default='awx',
                        help='PostgreSQL database name (database mode only)')
    parser.add_argument('--db-user', default='awx',
                        help='PostgreSQL user (database mode only)')
    parser.add_argument('--db-password', default='awx',
                        help='PostgreSQL password (database mode only)')
    parser.add_argument('--db-port', type=int, default=5432,
                        help='PostgreSQL port (database mode only)')

    args = parser.parse_args()

    print('=' * 60)
    print('Deprecation Data Seeding Tool')
    print('=' * 60)
    print(f'Mode: {args.mode}')
    print(f'Time range: {args.days} days')
    print(f'Jobs per day: {args.jobs_per_day}')
    print(f'Total jobs: {args.days * args.jobs_per_day}')
    print()

    awx = AWXSeeder(args.awx_host, args.awx_user, args.awx_password)
    db = None

    if args.mode == 'database':
        print('Connecting to database...')
        db = DatabaseBackdater(
            args.db_host, args.db_name, args.db_user,
            args.db_password, args.db_port
        )
        print('✓ Database connected')
        print()

    # Template rotation for variety
    templates = [
        'Test Deprecations - Aggressive',
        'Test Deprecations',
        'Test Deprecations - Working',
    ]

    total_jobs = args.days * args.jobs_per_day
    job_counter = 0

    for day in range(args.days):
        date = datetime.now() - timedelta(days=args.days - day - 1)
        print(f'Day {day + 1}/{args.days}: {date.date()}')

        for job_num in range(args.jobs_per_day):
            job_counter += 1
            template = templates[job_num % len(templates)]

            try:
                # Launch job
                job_id = awx.launch_job(template)

                # Wait for completion
                awx.wait_for_job(job_id)

                # Backdate if in database mode
                if args.mode == 'database' and db:
                    # Spread jobs throughout the day
                    hour_offset = timedelta(hours=job_num * 8)
                    job_date = date + hour_offset
                    db.backdate_job(job_id, job_date)

            except Exception as e:
                print(f'  ✗ Error: {e}')

            # Progress indicator
            progress = (job_counter / total_jobs) * 100
            print(f'  Progress: {job_counter}/{total_jobs} ({progress:.1f}%)')

        # Small delay between days to avoid overwhelming AWX
        if day < args.days - 1:
            time.sleep(2)

    if db:
        db.close()

    print()
    print('=' * 60)
    print('✓ Seeding complete!')
    print('=' * 60)
    print()
    print('Next steps:')
    print('1. Refresh the deprecations dashboard')
    if args.mode == 'api':
        print('2. Note: All jobs have current timestamps (API mode)')
        print('   For historical spread, use --mode database with DB credentials')
    else:
        print('2. Jobs are backdated across the last', args.days, 'days')
    print('3. Test different time ranges in the dropdown')
    print('4. Observe the trend graph showing deprecations over time')


if __name__ == '__main__':
    main()
