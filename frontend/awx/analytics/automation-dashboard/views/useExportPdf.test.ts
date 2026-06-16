/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useExportPdf } from './useExportPdf';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockGetPageUrl } = vi.hoisted(() => ({
  mockGetPageUrl: vi.fn(() => '/awx/analytics/automation-dashboard/print'),
}));

vi.mock('../../../../../framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../framework')>();
  return { ...actual, useGetPageUrl: vi.fn(() => mockGetPageUrl) };
});

vi.mock('../../../main/AwxRoutes', () => ({
  AwxRoute: { AutomationDashboardPrint: 'awx-automation-dashboard-print' },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useExportPdf', () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  test('should return a function', () => {
    const { result } = renderHook(() => useExportPdf([], {}, {}));
    expect(result.current).toBeTypeOf('function');
  });

  test('should open the print route in a new tab', async () => {
    const { result } = renderHook(() => useExportPdf([], {}, {}));

    await act(async () => {
      await result.current();
    });

    expect(openSpy).toHaveBeenCalledOnce();
    const [url, target] = openSpy.mock.calls[0] as [string, string];
    expect(url).toContain('/awx/analytics/automation-dashboard/print');
    expect(target).toBe('_blank');
  });

  test('should include queryParams in the print URL', async () => {
    const { result } = renderHook(() => useExportPdf([], {}, { tz: 'Europe/Dublin' }));

    await act(async () => {
      await result.current();
    });

    const [url] = openSpy.mock.calls[0] as [string];
    expect(url).toContain('tz=Europe%2FDublin');
  });

  test('should include filter state in the print URL', async () => {
    const toolbarFilters = [
      { key: 'period', label: 'Period', type: 'select', query: 'period', options: [] },
    ] as Parameters<typeof useExportPdf>[0];
    const filterState = { period: ['last_30_days'] };

    const { result } = renderHook(() => useExportPdf(toolbarFilters, filterState, {}));

    await act(async () => {
      await result.current();
    });

    const [url] = openSpy.mock.calls[0] as [string];
    expect(url).toContain('period=last_30_days');
  });

  test('should return a resolved promise', async () => {
    const { result } = renderHook(() => useExportPdf([], {}, {}));

    await expect(
      act(async () => {
        await result.current();
      })
    ).resolves.toBeUndefined();
  });
});
