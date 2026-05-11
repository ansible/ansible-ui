import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useDeprecationData } from './useDeprecationData';
import * as Data from '@ansible/common-ui/crud/Data';

describe('useDeprecationData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    vi.spyOn(Data, 'requestGet').mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useDeprecationData());

    expect(result.current.loading).toBe(true);
    expect(result.current.totalWarnings).toBe(0);
    expect(result.current.affectedJobs).toBe(0);
    expect(result.current.uniqueIssues).toBe(0);
    expect(result.current.deprecations).toEqual([]);
  });

  it('should fetch and categorize deprecations', async () => {
    const mockJobsResponse = {
      results: [{ id: 1 }, { id: 2 }],
      count: 2,
    };

    const mockEventsResponse = {
      count: 2,
      results: [
        {
          id: 1,
          event: 'deprecated',
          stdout: 'Using with_items on yum module is deprecated',
          start_line: 10,
          task: 'Install packages',
          play: 'main',
          playbook: 'site.yml',
          created: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          event: 'deprecated',
          stdout: 'Using with_items on apt module is deprecated',
          start_line: 20,
          task: 'Install packages',
          play: 'main',
          playbook: 'site.yml',
          created: '2024-01-01T00:00:00Z',
        },
      ],
    };

    vi.spyOn(Data, 'requestGet')
      .mockResolvedValueOnce(mockJobsResponse)
      .mockResolvedValue(mockEventsResponse);

    const { result } = renderHook(() => useDeprecationData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalWarnings).toBe(4);
    expect(result.current.affectedJobs).toBe(2);
    expect(result.current.uniqueIssues).toBe(1);
    expect(result.current.deprecations).toHaveLength(1);
    expect(result.current.deprecations[0].type).toBe('with_items on module');
    expect(result.current.deprecations[0].count).toBe(4);
  });

  it('should handle empty results', async () => {
    const mockJobsResponse = {
      results: [],
      count: 0,
    };

    vi.spyOn(Data, 'requestGet').mockResolvedValue(mockJobsResponse);

    const { result } = renderHook(() => useDeprecationData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalWarnings).toBe(0);
    expect(result.current.affectedJobs).toBe(0);
    expect(result.current.uniqueIssues).toBe(0);
    expect(result.current.deprecations).toEqual([]);
  });

  it('should handle API errors gracefully', async () => {
    vi.spyOn(Data, 'requestGet').mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useDeprecationData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalWarnings).toBe(0);
    expect(result.current.affectedJobs).toBe(0);
    expect(result.current.uniqueIssues).toBe(0);
  });
});
