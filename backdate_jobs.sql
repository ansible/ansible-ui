-- Backdate Recent Jobs for Deprecations Demo
--
-- This SQL script backdates the most recent 60 jobs across the last 30 days,
-- creating a historical spread of data for demonstrating the deprecations dashboard.
--
-- Usage:
--   psql -h localhost -U awx -d awx -f backdate_jobs.sql
--
-- Or from psql prompt:
--   \i backdate_jobs.sql

BEGIN;

-- Store job IDs and their backdated timestamps
CREATE TEMP TABLE IF NOT EXISTS backdated_jobs AS
WITH job_dates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY id DESC) as row_num,
    -- Spread jobs evenly over 30 days (every ~12 hours)
    NOW() - ((ROW_NUMBER() OVER (ORDER BY id DESC) - 1) * INTERVAL '12 hours') as backdated_created,
    NOW() - ((ROW_NUMBER() OVER (ORDER BY id DESC) - 1) * INTERVAL '12 hours') + INTERVAL '2 minutes' as backdated_finished
  FROM main_job
  WHERE status IN ('successful', 'failed')  -- Only completed jobs
    AND job_type = 'job'  -- Regular playbook jobs
  ORDER BY id DESC
  LIMIT 60
)
SELECT * FROM job_dates;

-- Update job timestamps
UPDATE main_job
SET
  created = bj.backdated_created,
  started = bj.backdated_created,
  finished = bj.backdated_finished,
  modified = bj.backdated_finished
FROM backdated_jobs bj
WHERE main_job.id = bj.id;

-- Update job events (including deprecation events)
UPDATE main_jobevent
SET
  created = bj.backdated_created + (main_jobevent.created - j.created),  -- Preserve relative timing
  modified = bj.backdated_finished
FROM backdated_jobs bj
JOIN main_job j ON j.id = bj.id
WHERE main_jobevent.job_id = bj.id;

-- Show summary
SELECT
  'Jobs backdated:' as summary,
  COUNT(*) as count
FROM backdated_jobs
UNION ALL
SELECT
  'Date range:',
  MIN(backdated_created)::date || ' to ' || MAX(backdated_created)::date
FROM backdated_jobs
UNION ALL
SELECT
  'Deprecation events backdated:',
  COUNT(*)::text
FROM main_jobevent me
JOIN backdated_jobs bj ON me.job_id = bj.id
WHERE me.event = 'deprecated';

COMMIT;

-- Verification queries
\echo '\n=== Verification ==='
\echo 'Jobs by day (last 30 days):'
SELECT
  created::date as date,
  COUNT(*) as jobs,
  SUM(CASE WHEN id IN (SELECT id FROM backdated_jobs) THEN 1 ELSE 0 END) as backdated
FROM main_job
WHERE created > NOW() - INTERVAL '30 days'
  AND job_type = 'job'
GROUP BY created::date
ORDER BY date DESC
LIMIT 30;

\echo '\nDeprecation events by day (last 30 days):'
SELECT
  me.created::date as date,
  COUNT(*) as deprecation_events
FROM main_jobevent me
JOIN main_job j ON me.job_id = j.id
WHERE me.event = 'deprecated'
  AND me.created > NOW() - INTERVAL '30 days'
GROUP BY me.created::date
ORDER BY date DESC
LIMIT 30;
