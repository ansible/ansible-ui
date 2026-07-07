import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { useGetLaunchedByDetails, useGetScheduleUrl } from './jobUtils';

vi.mock('@ansible/ansible-ui-framework/PageNavigation/useGetPageUrl', () => ({
  useGetPageUrl: () => (route: string, options?: { params?: Record<string, unknown> }) => {
    const params = options?.params ?? {};
    const paramStr = Object.entries(params)
      .map(([k, v]) => `${k}=${String(v)}`)
      .join('&');
    return `/${route}?${paramStr}`;
  },
}));

describe('useGetScheduleUrl', () => {
  it('should return empty string when no templateId or scheduleId', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const job = {
      type: 'job',
      summary_fields: { unified_job_template: undefined, schedule: undefined },
    } as unknown as UnifiedJob;
    expect(result.current(job)).toBe('');
  });

  it('should return empty string when templateId exists but no scheduleId', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const job = {
      type: 'job',
      summary_fields: { unified_job_template: { id: 10 }, schedule: undefined },
    } as unknown as UnifiedJob;
    expect(result.current(job)).toBe('');
  });

  it('should return schedule URL for job type', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const job = {
      type: 'job',
      summary_fields: { unified_job_template: { id: 10 }, schedule: { id: 5 } },
    } as unknown as UnifiedJob;
    const url = result.current(job);
    expect(url).toContain('id=10');
    expect(url).toContain('schedule_id=5');
  });

  it('should return schedule URL for workflow_job type', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const job = {
      type: 'workflow_job',
      summary_fields: { unified_job_template: { id: 20 }, schedule: { id: 3 } },
    } as unknown as UnifiedJob;
    const url = result.current(job);
    expect(url).toContain('id=20');
    expect(url).toContain('schedule_id=3');
  });

  it('should return schedule URL for project_update type', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const job = {
      type: 'project_update',
      summary_fields: { unified_job_template: { id: 15 }, schedule: { id: 7 } },
    } as unknown as UnifiedJob;
    const url = result.current(job);
    expect(url).toContain('id=15');
    expect(url).toContain('schedule_id=7');
  });

  it('should return schedule URL for system_job type', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const job = {
      type: 'system_job',
      summary_fields: { unified_job_template: { id: 1 }, schedule: { id: 2 } },
    } as unknown as UnifiedJob;
    const url = result.current(job);
    expect(url).toContain('id=1');
    expect(url).toContain('schedule_id=2');
  });

  it('should return schedule URL for inventory_update type with inventoryId', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const job = {
      type: 'inventory_update',
      summary_fields: {
        unified_job_template: { id: 30 },
        schedule: { id: 8 },
        inventory: { id: 99 },
      },
    } as unknown as UnifiedJob;
    const url = result.current(job);
    expect(url).toContain('id=99');
    expect(url).toContain('source_id=30');
    expect(url).toContain('schedule_id=8');
  });

  it('should return empty string for inventory_update without inventory', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const job = {
      type: 'inventory_update',
      summary_fields: { unified_job_template: { id: 30 }, schedule: { id: 8 } },
    } as unknown as UnifiedJob;
    expect(result.current(job)).toBe('');
  });

  it('should return empty string for unknown type with templateId and scheduleId', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const job = {
      type: 'unknown_type',
      summary_fields: { unified_job_template: { id: 10 }, schedule: { id: 5 } },
    } as unknown as UnifiedJob;
    expect(result.current(job)).toBe('');
  });
});

describe('useGetLaunchedByDetails', () => {
  it('should return empty object when no createdBy, schedule, or launchedBy', () => {
    const { result } = renderHook(() => useGetLaunchedByDetails());
    const job = {
      summary_fields: {},
      launch_type: 'manual',
    } as unknown as UnifiedJob;
    expect(result.current(job)).toEqual({});
  });

  it('should return webhook details for webhook launch_type with job_template', () => {
    const { result } = renderHook(() => useGetLaunchedByDetails());
    const job = {
      launch_type: 'webhook',
      summary_fields: {
        created_by: { id: 1, username: 'admin' },
        job_template: { id: 7 },
      },
    } as unknown as UnifiedJob;
    const details = result.current(job);
    expect(details.value).toBe('Webhook');
    expect(details.link).toContain('id=7');
  });

  it('should return webhook details for webhook launch_type with workflow_job_template', () => {
    const { result } = renderHook(() => useGetLaunchedByDetails());
    const job = {
      launch_type: 'webhook',
      summary_fields: {
        created_by: { id: 1, username: 'admin' },
        workflow_job_template: { id: 12 },
      },
    } as unknown as UnifiedJob;
    const details = result.current(job);
    expect(details.value).toBe('Webhook');
    expect(details.link).toContain('id=12');
  });

  it('should return empty link for webhook without job_template or workflow_job_template', () => {
    const { result } = renderHook(() => useGetLaunchedByDetails());
    const job = {
      launch_type: 'webhook',
      summary_fields: { created_by: { id: 1, username: 'admin' } },
    } as unknown as UnifiedJob;
    const details = result.current(job);
    expect(details.value).toBe('Webhook');
    expect(details.link).toBe('');
  });

  it('should return schedule name and link for scheduled launch_type', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const { result: launchedByResult } = renderHook(() => useGetLaunchedByDetails());
    const job = {
      type: 'job',
      launch_type: 'scheduled',
      summary_fields: {
        schedule: { id: 5, name: 'Daily Schedule' },
        unified_job_template: { id: 10 },
      },
    } as unknown as UnifiedJob;
    const details = launchedByResult.current(job);
    expect(details.value).toBe('Daily Schedule');
    expect(details.link).not.toBe('');
    expect(result.current(job)).not.toBe('');
  });

  it('should return user details for manual launch_type', () => {
    const { result } = renderHook(() => useGetLaunchedByDetails());
    const job = {
      launch_type: 'manual',
      summary_fields: { created_by: { id: 42, username: 'testuser' } },
    } as unknown as UnifiedJob;
    const details = result.current(job);
    expect(details.value).toBe('testuser');
    expect(details.link).toContain('id=42');
  });

  it('should return empty values for manual launch_type without created_by id', () => {
    const { result } = renderHook(() => useGetLaunchedByDetails());
    const job = {
      launch_type: 'manual',
      summary_fields: { created_by: { username: 'ghost' } },
    } as unknown as UnifiedJob;
    const details = result.current(job);
    expect(details.value).toBe('ghost');
    expect(details.link).toBe('');
  });

  it('should return translated name for dependency launched by AWX', () => {
    const { result } = renderHook(() => useGetLaunchedByDetails());
    const job = {
      launch_type: 'dependency',
      launched_by: { id: 1, name: 'Generated by AWX', type: 'user', url: '' },
      summary_fields: { created_by: { id: 1, username: 'admin' } },
    } as unknown as UnifiedJob;
    const details = result.current(job);
    expect(details.value).toBe('Generated by Ansible Automation Platform');
    expect(details.link).toBe('');
  });

  it('should return launched_by name for dependency not generated by AWX', () => {
    const { result } = renderHook(() => useGetLaunchedByDetails());
    const job = {
      launch_type: 'dependency',
      launched_by: { id: 2, name: 'Some Workflow', type: 'workflow_job', url: '' },
      summary_fields: { created_by: { id: 1, username: 'admin' } },
    } as unknown as UnifiedJob;
    const details = result.current(job);
    expect(details.value).toBe('Some Workflow');
    expect(details.link).toBe('');
  });

  it('should return user details for default/unknown launch_type', () => {
    const { result } = renderHook(() => useGetLaunchedByDetails());
    const job = {
      launch_type: 'relaunch',
      summary_fields: { created_by: { id: 10, username: 'relaunchuser' } },
    } as unknown as UnifiedJob;
    const details = result.current(job);
    expect(details.value).toBe('relaunchuser');
    expect(details.link).toContain('id=10');
  });

  it('should handle dependency with no launched_by name', () => {
    const { result } = renderHook(() => useGetLaunchedByDetails());
    const job = {
      launch_type: 'dependency',
      launched_by: { id: 2, type: 'workflow_job', url: '' },
      summary_fields: { created_by: { id: 1, username: 'admin' } },
    } as unknown as UnifiedJob;
    const details = result.current(job);
    expect(details.value).toBe('');
    expect(details.link).toBe('');
  });
});
