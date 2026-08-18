import { renderHook } from '@testing-library/react';
import { Frequency } from 'rrule';
import { describe, expect, it } from 'vitest';
import type { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import type { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import {
  ensureUntilZSuffix,
  mungePromptData,
  mungeSurveyAndExtraVarsData,
  normalizeOptions,
  useGetFrequencyOptions,
  useGetWeekdayOptions,
  useGetMonthOptions,
} from './ruleHelpers';

describe('mungePromptData', () => {
  it('should return empty object when prompt is undefined', () => {
    expect(mungePromptData(undefined as unknown as PromptFormValues)).toEqual({});
  });

  it('should include inventory id when present', () => {
    const prompt = {
      inventory: { id: 5 },
      job_tags: [],
      skip_tags: [],
    } as unknown as PromptFormValues;
    const result = mungePromptData(prompt);
    expect(result.inventory).toBe(5);
  });

  it('should include execution_environment id when present', () => {
    const prompt = {
      execution_environment: { id: 3, name: 'EE' },
      job_tags: [],
      skip_tags: [],
    } as unknown as PromptFormValues;
    const result = mungePromptData(prompt);
    expect(result.execution_environment).toBe(3);
  });

  it('should include fields gated by launchConfig flags', () => {
    const prompt = {
      job_tags: [{ name: 'deploy' }, { name: 'test' }],
      skip_tags: [{ name: 'debug' }],
      limit: 'web',
      job_type: 'check',
      verbosity: 3,
      diff_mode: true,
      scm_branch: 'main',
      forks: 5,
      job_slice_count: 2,
      timeout: 600,
      extra_vars: '{"key": "val"}',
    } as unknown as PromptFormValues;

    const launchConfig = {
      ask_tags_on_launch: true,
      ask_skip_tags_on_launch: true,
      ask_limit_on_launch: true,
      ask_job_type_on_launch: true,
      ask_verbosity_on_launch: true,
      ask_diff_mode_on_launch: true,
      ask_scm_branch_on_launch: true,
      ask_forks_on_launch: true,
      ask_job_slice_count_on_launch: true,
      ask_timeout_on_launch: true,
      ask_variables_on_launch: true,
    } as LaunchConfiguration;

    const result = mungePromptData(prompt, launchConfig);

    expect(result.job_tags).toBe('deploy,test');
    expect(result.skip_tags).toBe('debug');
    expect(result.limit).toBe('web');
    expect(result.job_type).toBe('check');
    expect(result.verbosity).toBe(3);
    expect(result.diff_mode).toBe(true);
    expect(result.scm_branch).toBe('main');
    expect(result.forks).toBe(5);
    expect(result.job_slice_count).toBe(2);
    expect(result.timeout).toBe(600);
    expect(result.extra_vars).toBe('{"key": "val"}');
  });

  it('should not include fields when launchConfig flags are false', () => {
    const prompt = {
      limit: 'web',
      job_type: 'check',
      verbosity: 3,
    } as unknown as PromptFormValues;

    const launchConfig = {
      ask_limit_on_launch: false,
      ask_job_type_on_launch: false,
      ask_verbosity_on_launch: false,
      ask_tags_on_launch: false,
      ask_skip_tags_on_launch: false,
      ask_diff_mode_on_launch: false,
      ask_scm_branch_on_launch: false,
      ask_forks_on_launch: false,
      ask_job_slice_count_on_launch: false,
      ask_timeout_on_launch: false,
      ask_variables_on_launch: false,
    } as LaunchConfiguration;

    const result = mungePromptData(prompt, launchConfig);

    expect(result.limit).toBeUndefined();
    expect(result.job_type).toBeUndefined();
    expect(result.verbosity).toBeUndefined();
  });

  it('should fall back to tags when no launchConfig provided', () => {
    const prompt = {
      job_tags: [{ name: 'a' }],
      skip_tags: [{ name: 'b' }],
    } as unknown as PromptFormValues;

    const result = mungePromptData(prompt);

    expect(result.job_tags).toBe('a');
    expect(result.skip_tags).toBe('b');
  });
});

describe('mungeSurveyAndExtraVarsData', () => {
  it('should return empty object when both survey and extra_vars are falsy', () => {
    expect(mungeSurveyAndExtraVarsData(null as unknown as Record<string, string>, '')).toEqual({});
  });

  it('should merge survey data with parsed extra_vars', () => {
    const survey = { question1: 'answer1', question2: 42 };
    const result = mungeSurveyAndExtraVarsData(survey, '{"extra_key": "extra_val"}');

    expect(result).toEqual({
      question1: 'answer1',
      question2: 42,
      extra_key: 'extra_val',
    });
  });

  it('should handle survey data only', () => {
    const survey = { color: 'blue' };
    const result = mungeSurveyAndExtraVarsData(survey, '');

    expect(result).toHaveProperty('color', 'blue');
  });

  it('should handle extra_vars only', () => {
    const result = mungeSurveyAndExtraVarsData({}, '{"name": "test"}');

    expect(result).toEqual({ name: 'test' });
  });

  it('should handle survey with array values', () => {
    const survey = { multiselect: ['opt1', 'opt2'] };
    const result = mungeSurveyAndExtraVarsData(survey, '{}');

    expect(result).toEqual({ multiselect: ['opt1', 'opt2'] });
  });
});

describe('useGetFrequencyOptions', () => {
  it('should return all six frequency options', () => {
    const { result } = renderHook(() => useGetFrequencyOptions());

    expect(result.current).toHaveLength(6);
    expect(result.current[0]).toEqual({ label: 'Yearly', value: Frequency.YEARLY });
    expect(result.current[5]).toEqual({ label: 'Minutely', value: Frequency.MINUTELY });
  });
});

describe('useGetWeekdayOptions', () => {
  it('should return all seven weekday options', () => {
    const { result } = renderHook(() => useGetWeekdayOptions());

    expect(result.current).toHaveLength(7);
    expect(result.current[0].label).toBe('Sunday');
    expect(result.current[6].label).toBe('Saturday');
  });
});

describe('useGetMonthOptions', () => {
  it('should return all twelve month options', () => {
    const { result } = renderHook(() => useGetMonthOptions());

    expect(result.current).toHaveLength(12);
    expect(result.current[0]).toEqual({ value: 1, label: 'January' });
    expect(result.current[11]).toEqual({ value: 12, label: 'December' });
  });
});

describe('ensureUntilZSuffix', () => {
  it('should return empty string unchanged', () => {
    expect(ensureUntilZSuffix('')).toBe('');
  });

  it('should return string with no UNTIL unchanged', () => {
    const input = 'DTSTART;TZID=America/New_York:20250101T120000 RRULE:FREQ=WEEKLY;COUNT=5';
    expect(ensureUntilZSuffix(input)).toBe(input);
  });

  it('should append Z to UNTIL without Z suffix', () => {
    const input =
      'DTSTART;TZID=America/New_York:20250101T120000 RRULE:FREQ=WEEKLY;UNTIL=20250201T120000';
    const expected =
      'DTSTART;TZID=America/New_York:20250101T120000 RRULE:FREQ=WEEKLY;UNTIL=20250201T120000Z';
    expect(ensureUntilZSuffix(input)).toBe(expected);
  });

  it('should not double-append Z when UNTIL already has Z suffix', () => {
    const input =
      'DTSTART;TZID=America/New_York:20250101T120000 RRULE:FREQ=WEEKLY;UNTIL=20250201T120000Z';
    expect(ensureUntilZSuffix(input)).toBe(input);
  });

  it('should fix all UNTIL clauses in a multi-rule string', () => {
    const input =
      'DTSTART;TZID=America/New_York:20250101T120000 RRULE:FREQ=WEEKLY;UNTIL=20250201T120000 RRULE:FREQ=DAILY;UNTIL=20250301T120000';
    const expected =
      'DTSTART;TZID=America/New_York:20250101T120000 RRULE:FREQ=WEEKLY;UNTIL=20250201T120000Z RRULE:FREQ=DAILY;UNTIL=20250301T120000Z';
    expect(ensureUntilZSuffix(input)).toBe(expected);
  });
});

describe('normalizeOptions', () => {
  it('should normalize null or undefined values into empty array []', () => {
    const mockOptions = [{ bysetpos: null }, { bysetpos: undefined }];
    mockOptions.forEach((option) => {
      const mockNormalized = normalizeOptions(option);
      expect(mockNormalized).toEqual({ bysetpos: [] });
    });
  });

  it('should normalize single values into [single value]', () => {
    const mockOptions = [{ bysetpos: 1 }, { bysetpos: 0 }];
    const expectedOptions = [{ bysetpos: [1] }, { bysetpos: [0] }];
    mockOptions.forEach((option, index) => {
      const mockNormalized = normalizeOptions(option);
      expect(mockNormalized).toEqual(expectedOptions[index]);
    });
  });

  it('should ignore values that are already an array', () => {
    const mockOptions = [{ bysetpos: [1, 3] }, { bysetpos: [1] }];
    mockOptions.forEach((option, index) => {
      const mockNormalized = normalizeOptions(option);
      expect(mockNormalized).toEqual(mockOptions[index]);
    });
  });

  it('should ignore keys that are not in propertiesToNormalize array', () => {
    const mockOptions = [{ freq: Frequency.DAILY }, { interval: 1 }, { baz: [{ qux: [1] }] }];
    mockOptions.forEach((option, index) => {
      const mockNormalized = normalizeOptions(option);
      expect(mockNormalized).toEqual(mockOptions[index]);
    });
  });
});
