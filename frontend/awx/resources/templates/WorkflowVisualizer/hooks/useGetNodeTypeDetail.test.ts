import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGetNodeTypeDetail } from './useGetNodeTypeDetail';
import type { UnifiedJobType } from '../types';

describe('useGetNodeTypeDetail', () => {
  it('should return null when type is undefined', () => {
    const { result } = renderHook(() => useGetNodeTypeDetail());
    expect(result.current).toBeNull();
  });

  it('should return "Job template" for job type', () => {
    const { result } = renderHook(() => useGetNodeTypeDetail('job'));
    expect(result.current).toBe('Job template');
  });

  it('should return "Workflow job template" for workflow_job type', () => {
    const { result } = renderHook(() => useGetNodeTypeDetail('workflow_job'));
    expect(result.current).toBe('Workflow job template');
  });

  it('should return "Project" for project_update type', () => {
    const { result } = renderHook(() => useGetNodeTypeDetail('project_update'));
    expect(result.current).toBe('Project');
  });

  it('should return "Inventory source" for inventory_update type', () => {
    const { result } = renderHook(() => useGetNodeTypeDetail('inventory_update'));
    expect(result.current).toBe('Inventory source');
  });

  it('should return "Workflow approval" for workflow_approval type', () => {
    const { result } = renderHook(() => useGetNodeTypeDetail('workflow_approval'));
    expect(result.current).toBe('Workflow approval');
  });

  it('should return "Management job" for system_job type', () => {
    const { result } = renderHook(() => useGetNodeTypeDetail('system_job'));
    expect(result.current).toBe('Management job');
  });

  it('should return undefined for an unknown type', () => {
    const { result } = renderHook(() => useGetNodeTypeDetail('unknown' as UnifiedJobType));
    expect(result.current).toBeUndefined();
  });
});
