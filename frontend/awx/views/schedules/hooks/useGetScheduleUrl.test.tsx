/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AwxRoute } from '../../../main/AwxRoutes';
import type { Schedule } from '../../../interfaces/Schedule';
import { useGetScheduleUrl } from './useGetScheduleUrl';

function makeSchedule(unifiedJobType: string, overrides?: { inventoryId?: number }): Schedule {
  return {
    id: 42,
    summary_fields: {
      unified_job_template: {
        id: 10,
        name: 'Test Template',
        description: '',
        unified_job_type: unifiedJobType,
        job_type: 'run',
      },
      ...(overrides?.inventoryId
        ? { inventory: { id: overrides.inventoryId, name: 'Inv', kind: '', organization_id: 1 } }
        : {}),
      user_capabilities: { edit: true, delete: true },
      created_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
      modified_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    },
  } as unknown as Schedule;
}

describe('useGetScheduleUrl', () => {
  it('should return inventory sync routes for inventory_update type', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const schedule = makeSchedule('inventory_update', { inventoryId: 5 });

    const name = result.current('name', schedule);
    expect(name).toBe('Inventory sync');

    const details = result.current('details', schedule);
    expect(details).toEqual({
      pageId: AwxRoute.InventorySourceScheduleDetails,
      params: {
        id: '5',
        source_id: '10',
        schedule_id: '42',
        inventory_type: 'inventory',
      },
    });

    const edit = result.current('edit', schedule);
    expect(edit).toEqual({
      pageId: AwxRoute.InventorySourceScheduleEdit,
      params: expect.objectContaining({ id: '5', schedule_id: '42' }),
    });

    const create = result.current('create', schedule);
    expect(create).toEqual({
      pageId: AwxRoute.InventorySourceScheduleCreate,
      params: expect.objectContaining({ id: '5' }),
    });

    const resource = result.current('resource', schedule);
    expect(resource).toEqual({
      pageId: AwxRoute.InventorySourceDetail,
      params: expect.objectContaining({ id: '5' }),
    });

    const scheduleList = result.current('scheduleList', schedule);
    expect(scheduleList).toEqual({
      pageId: AwxRoute.InventorySourceSchedules,
      params: expect.objectContaining({ id: '5' }),
    });
  });

  it('should return job template routes for job type', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const schedule = makeSchedule('job');

    expect(result.current('name', schedule)).toBe('Playbook run');
    expect(result.current('details', schedule)).toEqual({
      pageId: AwxRoute.JobTemplateScheduleDetails,
      params: { id: '10', schedule_id: '42' },
    });
    expect(result.current('edit', schedule)).toEqual({
      pageId: AwxRoute.JobTemplateScheduleEdit,
      params: { id: '10', schedule_id: '42' },
    });
    expect(result.current('resource', schedule)).toEqual({
      pageId: AwxRoute.JobTemplateDetails,
      params: { id: '10', schedule_id: '42' },
    });
    expect(result.current('scheduleList', schedule)).toEqual({
      pageId: AwxRoute.JobTemplateSchedules,
      params: { id: '10', schedule_id: '42' },
    });
  });

  it('should return project routes for project_update type', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const schedule = makeSchedule('project_update');

    expect(result.current('name', schedule)).toBe('Project update');
    expect(result.current('details', schedule)).toEqual({
      pageId: AwxRoute.ProjectScheduleDetails,
      params: { id: '10', schedule_id: '42' },
    });
    expect(result.current('resource', schedule)).toEqual({
      pageId: AwxRoute.ProjectDetails,
      params: { id: '10', schedule_id: '42' },
    });
  });

  it('should return management job routes for system_job type', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const schedule = makeSchedule('system_job');

    expect(result.current('name', schedule)).toBe('Management job');
    expect(result.current('details', schedule)).toEqual({
      pageId: AwxRoute.ManagementJobScheduleDetails,
      params: { id: '10', schedule_id: '42' },
    });
    expect(result.current('resource', schedule)).toEqual({
      pageId: AwxRoute.ManagementJobSchedules,
      params: { id: '10', schedule_id: '42' },
    });
  });

  it('should return workflow job routes for workflow_job type', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const schedule = makeSchedule('workflow_job');

    expect(result.current('name', schedule)).toBe('Workflow job');
    expect(result.current('details', schedule)).toEqual({
      pageId: AwxRoute.WorkflowJobTemplateScheduleDetails,
      params: { id: '10', schedule_id: '42' },
    });
    expect(result.current('resource', schedule)).toEqual({
      pageId: AwxRoute.WorkflowJobTemplateDetails,
      params: { id: '10', schedule_id: '42' },
    });
  });

  it('should return empty string for unknown unified_job_type', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const schedule = makeSchedule('unknown_type');

    expect(result.current('name', schedule)).toBe('');
    expect(result.current('details', schedule)).toBe('');
  });

  it('should return undefined for unrecognized route key', () => {
    const { result } = renderHook(() => useGetScheduleUrl());
    const schedule = makeSchedule('job');

    expect(result.current('nonexistent', schedule)).toBeUndefined();
  });
});
