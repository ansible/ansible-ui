import useSWR from 'swr';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';

export interface JobEvent {
  id: number;
  event: string;
  stdout: string;
  counter?: number;
  start_line: number;
  task: string;
  play: string;
  playbook: string;
  created: string;
  job: number;
}

export interface DeprecationStat {
  type: string;
  description: string;
  count: number;
  severity: 'hot' | 'warm' | 'moderate' | 'cool';
  jobIds: number[];
  jobOccurrences: Record<number, number>; // job id -> occurrence count for this deprecation type
  organizations: string[]; // unique organization names from affected jobs
  jobTemplates: string[]; // unique job template names from affected jobs
}

interface DeprecationData {
  totalWarnings: number;
  affectedJobs: number;
  uniqueIssues: number;
  deprecations: DeprecationStat[];
  /** true when a per-job event fetch failed or hit the page cap (data is partial) */
  hasPartialData: boolean;
}

// Helper to extract deprecation type from one deprecation message and its task name
function extractDeprecationType(stdout: string, task: string): string {
  // Check stdout first (for events that have deprecation text)
  if (stdout.includes('with_items')) return 'with_items on module';
  if (stdout.includes('with_dict')) return 'with_dict loop';
  if (stdout.includes('bare variable') || stdout.includes('Conditional result')) {
    return 'Bare variables in conditionals';
  }
  // Match the deprecated bare `include:` directive, not modern include_tasks/include_role
  if (/\binclude:\s/.test(stdout)) return 'include directive';
  if (stdout.includes('squash_actions')) return 'squash_actions';
  if (stdout.includes('hash_behaviour')) return 'hash_behaviour';

  // If stdout is empty, check task name (common for bare conditional deprecations)
  const taskLower = task.toLowerCase();
  if (taskLower.includes('bare') && taskLower.includes('conditional')) {
    return 'Bare variables in conditionals';
  }
  if (taskLower.includes('with_items')) return 'with_items on module';
  if (taskLower.includes('with_dict')) return 'with_dict loop';

  // Extract a meaningful type from the deprecation message itself
  // Format: "[DEPRECATION WARNING]: <message text>. This feature will be removed..."
  // Look for the ending phrase but don't stop at periods in paths/module names
  const match = stdout.match(
    /\[DEPRECATION WARNING\]:\s*(.+?)(?:\s+This feature|\s+Deprecation warnings|\s+It will be removed)/i
  );
  if (match && match[1]) {
    let extracted = match[1].trim();
    // Remove trailing period if present
    if (extracted.endsWith('.')) {
      extracted = extracted.slice(0, -1);
    }
    // Truncate to 80 chars at word boundary if needed
    if (extracted.length > 80) {
      extracted = extracted.slice(0, 80);
      const lastSpace = extracted.lastIndexOf(' ');
      if (lastSpace > 60) {
        extracted = extracted.slice(0, lastSpace);
      }
    }
    return extracted;
  }

  return 'Other deprecation';
}

const DEPRECATION_MARKER = '[DEPRECATION WARNING]';
// ANSI escape sequence patterns constructed without literal control characters to satisfy no-control-regex
const ESC = String.fromCharCode(0x1b);
const ANSI_ESCAPE = new RegExp(`${ESC}\\[[0-9;]*[A-Za-z]`, 'g');
const LEADING_ANSI = new RegExp(`^(?:${ESC}\\[[0-9;]*[A-Za-z])*`);
// Lines that end a deprecation message (task results, banners, other warnings, and the
// ansible-core 2.19+ "Origin: <file>:<line>" source context, which shares the warning's colour)
const END_OF_MESSAGE =
  /^(ok|changed|skipping|fatal|failed|included|TASK \[|PLAY|RUNNING HANDLER|\[WARNING\]|\[ERROR\]|Origin: )/;

/**
 * Pull each "[DEPRECATION WARNING]: ..." message out of a sequence of raw stdout lines.
 * ansible-core 2.16/2.18 wrap long messages at 80 columns and re-colour every line, so a message
 * continues while the following lines carry the same colour as its first line. ANSI codes are
 * stripped and the wrapped lines are re-joined. A `null` entry is a hard break.
 */
export function extractDeprecationMessagesFromLines(rawLines: (string | null)[]): string[] {
  const messages: string[] = [];
  let current: string[] | undefined;
  let colour = '';
  const flush = () => {
    if (current) messages.push(current.join('').trim());
    current = undefined;
  };
  for (const raw of rawLines) {
    if (raw === null) {
      flush();
      continue;
    }
    const line = raw.replace(ANSI_ESCAPE, '');
    if (line.includes(DEPRECATION_MARKER)) {
      flush();
      colour = LEADING_ANSI.exec(raw)?.[0] ?? '';
      current = [line.slice(line.indexOf(DEPRECATION_MARKER))];
    } else if (
      current &&
      line.trim() &&
      !END_OF_MESSAGE.test(line) &&
      (!colour || raw.startsWith(colour))
    ) {
      current.push(line);
    } else {
      flush();
    }
  }
  flush();
  return messages;
}

/** Deprecation messages inside one event's stdout (e.g. a runner_on_ok event on ansible-core 2.19+). */
export function extractDeprecationMessages(stdout: string): string[] {
  return extractDeprecationMessagesFromLines((stdout || '').split(/\r?\n/));
}

interface DeprecationOccurrence {
  text: string;
  task: string;
}

const isStreamEvent = (event: JobEvent) =>
  event.event === 'deprecated' || event.event === 'verbose';

/** An empty `deprecated` marker and the stream lines printed after it. */
interface StreamSegment {
  marker?: DeprecationOccurrence;
  lines: (string | null)[];
}

const isEmptyMarker = (event: JobEvent) => event.event === 'deprecated' && !event.stdout?.trim();

/**
 * Group the deprecated/verbose stream (sorted by counter) into one segment per empty marker.
 * `deprecated` events that carry text without the usual prefix (an older event shape) are
 * returned as occurrences. ansible-core 2.20 also tags its "deprecation warnings can be disabled"
 * [WARNING] as deprecated; that event is skipped.
 */
function splitStream(streamEvents: JobEvent[]) {
  const segments: StreamSegment[] = [];
  const bareText: DeprecationOccurrence[] = [];
  let previousCounter: number | undefined;

  for (const event of streamEvents) {
    const stdout = event.stdout || '';
    const isContiguous =
      event.counter !== undefined &&
      previousCounter !== undefined &&
      event.counter === previousCounter + 1;
    previousCounter = event.counter;

    if (isEmptyMarker(event)) {
      segments.push({ marker: { text: '', task: event.task || '' }, lines: [] });
      continue;
    }
    if (event.event === 'deprecated' && !stdout.includes(DEPRECATION_MARKER)) {
      if (!stdout.includes('[WARNING]')) bareText.push({ text: stdout, task: event.task || '' });
      continue;
    }
    if (segments.length === 0) segments.push({ lines: [] });
    const { lines } = segments[segments.length - 1];
    if (!isContiguous) lines.push(null);
    lines.push(...stdout.split(/\r?\n/));
  }
  return { segments, bareText };
}

/**
 * Drop one text-less marker for each warning printed in a task result, preferring a marker from
 * the same task, since that marker's text is the task result's warning.
 */
function withoutMarkersExplainedBy(
  markers: DeprecationOccurrence[],
  taskOccurrences: DeprecationOccurrence[]
): DeprecationOccurrence[] {
  const remaining = [...markers];
  for (const occurrence of taskOccurrences) {
    if (remaining.length === 0) break;
    const sameTask = remaining.findIndex((marker) => marker.task === occurrence.task);
    remaining.splice(Math.max(sameTask, 0), 1);
  }
  return remaining;
}

/**
 * Turn a job's events into one entry per deprecation warning.
 *
 * In AAP the `deprecated` event is only an empty marker. The message text arrives afterwards as
 * `verbose` events, one line per event, so the text is rebuilt from the deprecated/verbose event
 * stream in counter order (a gap in the counter means another event type sat in between).
 * Task-level deprecations (module.deprecate(), and everything raised during a task on
 * ansible-core 2.19+) are printed inside the task's own result event and are read from there.
 *
 * Each empty marker owns the stream lines that follow it. A marker whose lines hold no message is
 * still counted, unless a task result event supplies the text for it, so nothing is counted twice
 * and nothing is dropped.
 */
export function getDeprecationOccurrences(events: JobEvent[]): DeprecationOccurrence[] {
  const byId = new Map(events.map((event) => [event.id, event]));
  const sorted = [...byId.values()].sort((a, b) => (a.counter ?? 0) - (b.counter ?? 0));

  const taskOccurrences = sorted
    .filter((event) => !isStreamEvent(event))
    .flatMap((event) =>
      extractDeprecationMessages(event.stdout || '').map((text) => ({
        text,
        task: event.task || '',
      }))
    );

  const { segments, bareText } = splitStream(sorted.filter(isStreamEvent));
  const streamOccurrences: DeprecationOccurrence[] = [...bareText];
  const textlessMarkers: DeprecationOccurrence[] = [];
  for (const { marker, lines } of segments) {
    const messages = extractDeprecationMessagesFromLines(lines);
    messages.forEach((text) => streamOccurrences.push({ text, task: '' }));
    if (marker && messages.length === 0) textlessMarkers.push(marker);
  }

  return [
    ...taskOccurrences,
    ...streamOccurrences,
    ...withoutMarkersExplainedBy(textlessMarkers, taskOccurrences),
  ];
}

const EVENTS_PAGE_SIZE = 200;
const MAX_EVENT_PAGES = 5;

interface JobEventsResult {
  events: JobEvent[];
  /** true when the page cap was reached and more events were left unread */
  truncated: boolean;
}

async function fetchJobEvents(
  jobId: number,
  filters: Record<string, string>
): Promise<JobEventsResult> {
  const params = new URLSearchParams({
    ...filters,
    order_by: 'counter',
    page_size: String(EVENTS_PAGE_SIZE),
  });
  const events: JobEvent[] = [];
  for (let page = 1; page <= MAX_EVENT_PAGES; page++) {
    params.set('page', String(page));
    const eventsUrl = awxAPI`/jobs/${jobId.toString()}/job_events/`;
    const response = await requestGet<{ count: number; next?: string | null; results: JobEvent[] }>(
      `${eventsUrl}?${params.toString()}`
    );
    events.push(...response.results);
    if (!response.next) return { events, truncated: false };
  }
  return { events, truncated: true };
}

/**
 * Fetch the events of a job that hold deprecation warnings.
 * AAP rejects filters on `stdout` (403), so text is found with `search` and by reading the
 * deprecated/verbose event stream, which only exists when the job has deprecated markers.
 */
async function fetchJobDeprecationEvents(jobId: number): Promise<JobEventsResult> {
  const [markers, searched] = await Promise.all([
    fetchJobEvents(jobId, { event: 'deprecated' }),
    fetchJobEvents(jobId, { search: 'DEPRECATION' }),
  ]);
  if (markers.events.length === 0) return searched;
  const stream = await fetchJobEvents(jobId, { event__in: 'deprecated,verbose' });
  return {
    events: [...markers.events, ...searched.events, ...stream.events],
    truncated: markers.truncated || searched.truncated || stream.truncated,
  };
}

// Helper to get description for deprecation type
export function getDeprecationDescription(type: string): string {
  const descriptions: Record<string, string> = {
    'with_items on module': 'Using with_items on package modules (yum, dnf, apt)',
    'with_dict loop': 'Deprecated in favor of loop with dict2items filter',
    'Bare variables in conditionals': 'Variables in when statements should use {{ }} syntax',
    'include directive': 'Use import_tasks or include_tasks instead',
    squash_actions: 'Invoking modules only once while using loop',
    hash_behaviour: 'Deprecated ansible.cfg setting for hash merging',
  };
  return descriptions[type] || 'Deprecated Ansible pattern';
}

function getSeverity(count: number): 'hot' | 'warm' | 'moderate' | 'cool' {
  if (count > 50) return 'hot';
  if (count > 25) return 'warm';
  if (count > 10) return 'moderate';
  return 'cool';
}

const CONCURRENCY_LIMIT = 10;

/** Run promises in batches to avoid flooding the API with concurrent requests. */
async function runInBatches<T>(items: T[], fn: (item: T) => Promise<void>): Promise<number> {
  let failureCount = 0;
  for (let i = 0; i < items.length; i += CONCURRENCY_LIMIT) {
    const batch = items.slice(i, i + CONCURRENCY_LIMIT);
    const results = await Promise.allSettled(batch.map(fn));
    failureCount += results.filter((r) => r.status === 'rejected').length;
  }
  return failureCount;
}

interface Job {
  id: number;
  summary_fields?: {
    organization?: { name: string };
    job_template?: { name: string };
  };
}

async function fetchDeprecationStats() {
  const jobsUrl = awxAPI`/jobs/?page_size=50&order_by=-created`;

  const jobsResponse = await requestGet<{ results: Job[]; count: number }>(jobsUrl);
  const jobs = jobsResponse.results;
  const deprecationsByType: Record<
    string,
    {
      count: number;
      jobIds: Set<number>;
      jobOccurrences: Record<number, number>;
      organizations: Set<string>;
      jobTemplates: Set<string>;
    }
  > = {};
  const affectedJobsSet = new Set<number>();
  let totalWarnings = 0;
  let truncatedJobs = 0;

  const failureCount = await runInBatches(jobs, async (job) => {
    const { events, truncated } = await fetchJobDeprecationEvents(job.id);
    if (truncated) truncatedJobs++;
    const occurrences = getDeprecationOccurrences(events);
    if (occurrences.length > 0) {
      affectedJobsSet.add(job.id);
      totalWarnings += occurrences.length;
      occurrences.forEach((occurrence) => {
        const type = extractDeprecationType(occurrence.text, occurrence.task);
        if (!deprecationsByType[type]) {
          deprecationsByType[type] = {
            count: 0,
            jobIds: new Set(),
            jobOccurrences: {},
            organizations: new Set(),
            jobTemplates: new Set(),
          };
        }
        deprecationsByType[type].count++;
        deprecationsByType[type].jobIds.add(job.id);
        deprecationsByType[type].jobOccurrences[job.id] =
          (deprecationsByType[type].jobOccurrences[job.id] ?? 0) + 1;

        // Capture organization and job template from job summary_fields
        if (job.summary_fields?.organization?.name) {
          deprecationsByType[type].organizations.add(job.summary_fields.organization.name);
        }
        if (job.summary_fields?.job_template?.name) {
          deprecationsByType[type].jobTemplates.add(job.summary_fields.job_template.name);
        }
      });
    }
  });

  return { totalWarnings, affectedJobsSet, deprecationsByType, failureCount, truncatedJobs };
}

// Fetch and aggregate deprecation data from the last 50 jobs
async function fetchDeprecations(): Promise<DeprecationData> {
  const current = await fetchDeprecationStats();

  const deprecations: DeprecationStat[] = Object.entries(current.deprecationsByType)
    .map(([type, data]) => ({
      type,
      description: getDeprecationDescription(type),
      count: data.count,
      severity: getSeverity(data.count),
      jobIds: Array.from(data.jobIds),
      jobOccurrences: data.jobOccurrences,
      organizations: Array.from(data.organizations),
      jobTemplates: Array.from(data.jobTemplates),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalWarnings: current.totalWarnings,
    affectedJobs: current.affectedJobsSet.size,
    uniqueIssues: deprecations.length,
    deprecations,
    hasPartialData: current.failureCount > 0 || current.truncatedJobs > 0,
  };
}

export function useDeprecationData(): {
  data?: DeprecationData;
  error?: Error;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => void;
} {
  const { data, error, isLoading, isValidating, mutate } = useSWR<DeprecationData, Error>(
    'deprecations-dashboard',
    () => fetchDeprecations(),
    { revalidateOnFocus: false }
  );

  return { data, error, isLoading, isRefreshing: isValidating, refresh: () => void mutate() };
}
