# Deprecations Dashboard - Demo Data Setup

This guide helps you generate historical deprecation data for demo purposes.

## Quick Options

### Option 1: Generate Data Right Now (5 minutes)

Creates multiple jobs **now** to populate the dashboard. Won't have historical spread, but shows all features.

```bash
# Make script executable
chmod +x seed_deprecation_data.sh

# Run 20 jobs with 10 second delays (~3-4 minutes)
./seed_deprecation_data.sh 20 10

# Or run Python version (more configurable)
python3 seed_historical_deprecations.py --mode api --days 7 --jobs-per-day 3
```

**Result**: Dashboard shows data for "today" across multiple jobs

---

### Option 2: Backdate Timestamps (Requires Database Access)

**Best for demos** - creates data spread over the last 30 days with decreasing trend.

#### Prerequisites
```bash
pip install psycopg2-binary
```

#### Run Script
```bash
python3 seed_historical_deprecations.py \
  --mode database \
  --days 30 \
  --jobs-per-day 3 \
  --db-host localhost \
  --db-name awx \
  --db-user awx \
  --db-password awx
```

**Result**: 
- 90 jobs spread over 30 days
- Decreasing deprecation trend (simulates fixes)
- All time range options show meaningful data

---

### Option 3: Manual SQL (Fastest for DB Access)

If you have direct PostgreSQL access, run this SQL to backdate existing jobs:

```sql
-- Backdate your most recent 50 jobs across the last 30 days
WITH job_dates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY id DESC) as row_num,
    NOW() - ((ROW_NUMBER() OVER (ORDER BY id DESC) - 1) * INTERVAL '14 hours') as backdated_time
  FROM main_job
  WHERE job_type IN ('job', 'playbook')
  ORDER BY id DESC
  LIMIT 50
)
UPDATE main_job
SET 
  created = jd.backdated_time,
  started = jd.backdated_time,
  finished = jd.backdated_time + INTERVAL '2 minutes',
  modified = jd.backdated_time + INTERVAL '2 minutes'
FROM job_dates jd
WHERE main_job.id = jd.id;

-- Also backdate the job events
UPDATE main_jobevent
SET 
  created = j.created,
  modified = j.finished
FROM main_job j
WHERE main_jobevent.job_id = j.id;
```

**Result**: Existing jobs are backdated, instant demo data

---

## What Each Time Range Shows

After seeding data:

| Time Range | Expected Data |
|------------|---------------|
| **Last 7 days** | Recent deprecations, shows current state |
| **Last 30 days** | Full trend visible, declining pattern |
| **Last 6 months** | Long-term view (if you have 6 months of jobs) |
| **Last year** | Very long-term trends |
| **All time** | Everything (may be slow with 1000+ jobs) |

---

## Expected Dashboard After Seeding

### Stats Cards
- **Total Warnings**: 50-150 (depending on days seeded)
- **Affected Jobs**: 20-90
- **Unique Issues**: 2-3 types

### Trend Graph
Should show:
- **Upward trend** if deprecations are increasing (bad - not fixing)
- **Downward trend** if deprecations are decreasing (good - actively fixing)
- **Flat line** if stable

### Heat Map
- "Other deprecation" (yellow/orange bar)
- "Bare variables in conditionals" (green bar)
- Both clickable to filtered jobs list

---

## Troubleshooting

### "Template not found" Error
Create the job templates first:
1. Go to Templates in AWX UI
2. Create job template pointing to test playbooks:
   - `test_deprecations.yml`
   - `test_deprecations_aggressive.yml`
   - `test_deprecations_working.yml`

### "Database connection failed"
Check PostgreSQL credentials:
```bash
# Test connection
psql -h localhost -U awx -d awx -c "SELECT COUNT(*) FROM main_job;"
```

### Jobs not showing in dashboard
1. Verify jobs ran: Check Jobs page in AWX
2. Check for `deprecated` events: 
   ```bash
   curl -k -u admin:password "https://localhost:8043/api/v2/jobs/123/job_events/?event=deprecated"
   ```
3. Clear SWR cache: Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

---

## Demo Script

**Scenario**: "Track and fix deprecations over 30 days"

1. **Show All Time** - "We've accumulated 150 deprecation warnings over the last year"
2. **Switch to Last 30 days** - "In the last month, we've been actively fixing them"
3. **Point to trend graph** - "You can see deprecations decreasing from 50/day to 10/day"
4. **Click 'Other deprecation'** - "This shows the 5 job templates that still need fixes"
5. **Click a job** - "We can drill down to see exactly which playbook tasks need updating"

---

## Clean Up

To remove demo data:
```sql
-- Delete all jobs from last 30 days
DELETE FROM main_job 
WHERE created > NOW() - INTERVAL '30 days'
  AND name LIKE '%Test Deprecations%';
```

Or just delete the job templates in AWX UI.
