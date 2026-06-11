import { describe, expect, test } from 'vitest';
import { clearStaleNodeFields } from './clearStaleNodeFields';

describe('clearStaleNodeFields', () => {
  test('should set all prompt fields to null when payload is empty', () => {
    const payload: Record<string, unknown> = {};
    clearStaleNodeFields(payload);

    expect(payload.diff_mode).toBeNull();
    expect(payload.execution_environment).toBeNull();
    expect(payload.forks).toBeNull();
    expect(payload.inventory).toBeNull();
    expect(payload.job_slice_count).toBeNull();
    expect(payload.job_tags).toBeNull();
    expect(payload.job_type).toBeNull();
    expect(payload.limit).toBeNull();
    expect(payload.scm_branch).toBeNull();
    expect(payload.skip_tags).toBeNull();
    expect(payload.timeout).toBeNull();
    expect(payload.verbosity).toBeNull();
    expect(payload.extra_data).toEqual({});
  });

  test('should not overwrite fields that are already set', () => {
    const payload: Record<string, unknown> = {
      limit: '5',
      forks: 10,
      extra_data: { my_var: 'value' },
    };
    clearStaleNodeFields(payload);

    expect(payload.limit).toBe('5');
    expect(payload.forks).toBe(10);
    expect(payload.extra_data).toEqual({ my_var: 'value' });
    expect(payload.diff_mode).toBeNull();
    expect(payload.verbosity).toBeNull();
  });

  test('should preserve fields set to explicit values including falsy ones', () => {
    const payload: Record<string, unknown> = {
      diff_mode: false,
      forks: 0,
      timeout: 0,
    };
    clearStaleNodeFields(payload);

    expect(payload.diff_mode).toBe(false);
    expect(payload.forks).toBe(0);
    expect(payload.timeout).toBe(0);
  });

  test('should set extra_data to empty object not null', () => {
    const payload: Record<string, unknown> = {};
    clearStaleNodeFields(payload);

    expect(payload.extra_data).toEqual({});
    expect(payload.extra_data).not.toBeNull();
  });

  test('should handle payload with non-prompt fields without affecting them', () => {
    const payload: Record<string, unknown> = {
      unified_job_template: 42,
      all_parents_must_converge: true,
      identifier: 'my-node',
    };
    clearStaleNodeFields(payload);

    expect(payload.unified_job_template).toBe(42);
    expect(payload.all_parents_must_converge).toBe(true);
    expect(payload.identifier).toBe('my-node');
    expect(payload.limit).toBeNull();
  });
});
