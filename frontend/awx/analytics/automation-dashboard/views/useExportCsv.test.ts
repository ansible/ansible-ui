/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, MockInstance, test, vi } from 'vitest';
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useExportCsv } from './useExportCsv';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockAddAlert } = vi.hoisted(() => ({
  mockAddAlert: vi.fn(),
}));

vi.mock('../../../../../framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../framework')>();
  return { ...actual, usePageAlertToaster: vi.fn(() => ({ addAlert: mockAddAlert })) };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const nameFilter: IToolbarFilter = {
  type: ToolbarFilterType.SingleText,
  key: 'name',
  label: 'Name',
  query: 'name',
  comparison: 'contains',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useExportCsv', () => {
  let fetchSpy: MockInstance;
  let createObjectUrlSpy: MockInstance;
  let revokeObjectUrlSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    const mockBlob = new Blob(['col1,col2\nval1,val2'], { type: 'text/csv' });
    fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(mockBlob, { status: 200 }));

    createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    fetchSpy.mockRestore();
    createObjectUrlSpy.mockRestore();
    revokeObjectUrlSpy.mockRestore();
  });

  // --- Basic ---

  test('should return a function', () => {
    const { result } = renderHook(() => useExportCsv([], {}, {}));
    expect(result.current).toBeTypeOf('function');
  });

  // --- Success path ---

  test('should fetch CSV endpoint and trigger programmatic download', async () => {
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current();
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('dashboard_reports/report/csv/'),
      expect.anything()
    );
    expect(createObjectUrlSpy).toHaveBeenCalledWith(expect.any(Blob));

    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  test('should not call window.open', async () => {
    const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => null);
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current();
    });

    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  // --- URL building ---

  test('should include queryParams in the URL', async () => {
    const { result } = renderHook(() => useExportCsv([], {}, { period: 'last_7_days' }));

    await act(async () => {
      await result.current();
    });

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain('period=last_7_days');
  });

  test('should include filter state values in the URL', async () => {
    const { result } = renderHook(() => useExportCsv([nameFilter], { name: ['my-template'] }, {}));

    await act(async () => {
      await result.current();
    });

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain('name=my-template');
  });

  test('should include both queryParams and filter state in the URL', async () => {
    const { result } = renderHook(() =>
      useExportCsv([nameFilter], { name: ['ansible'] }, { tz: 'Europe/Ljubljana' })
    );

    await act(async () => {
      await result.current();
    });

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain('tz=Europe%2FLjubljana');
    expect(url).toContain('name=ansible');
  });

  // --- Error path ---

  test('should show danger alert when response is not ok', async () => {
    fetchSpy.mockResolvedValue(
      new Response(null, { status: 422, statusText: 'Unprocessable Entity' })
    );
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current();
    });

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'danger', title: 'Failed to export CSV.' })
    );
    expect(createObjectUrlSpy).not.toHaveBeenCalled();
  });

  test('should show danger alert with error message when fetch throws a network error', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current();
    });

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to export CSV.',
        children: 'Network error',
      })
    );
  });

  test('should show danger alert with fallback message when thrown value is not an Error', async () => {
    fetchSpy.mockRejectedValue('string error');
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current();
    });

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'danger', children: 'An unknown error occurred.' })
    );
  });
});
