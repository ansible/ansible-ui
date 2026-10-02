const NULLABLE_PROMPT_FIELDS = [
  'diff_mode',
  'execution_environment',
  'forks',
  'inventory',
  'job_slice_count',
  'job_tags',
  'job_type',
  'limit',
  'scm_branch',
  'skip_tags',
  'timeout',
  'verbosity',
] as const;

export function clearStaleNodeFields(payload: Record<string, unknown>): void {
  for (const key of NULLABLE_PROMPT_FIELDS) {
    if (!(key in payload)) {
      payload[key] = null;
    }
  }
  if (!('extra_data' in payload)) {
    payload['extra_data'] = {};
  }
}
