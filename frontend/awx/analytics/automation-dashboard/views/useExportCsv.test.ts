/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, MockInstance, test, vi } from 'vitest';
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useExportCsv } from './useExportCsv';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockAddAlert, mockDownloadBlobFile } = vi.hoisted(() => ({
  mockAddAlert: vi.fn(),
  mockDownloadBlobFile: vi.fn(),
}));

vi.mock('../../../../../framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../framework')>();
  return { ...actual, usePageAlertToaster: vi.fn(() => ({ addAlert: mockAddAlert })) };
});

vi.mock('../../../../../framework/utils/download-file', () => ({
  downloadBlobFile: mockDownloadBlobFile,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const nameFilter: IToolbarFilter = {
  type: ToolbarFilterType.SingleText,
  key: 'name',
  label: 'Name',
  query: 'name',
  comparison: 'contains',
};

const periodFilter: IToolbarFilter = {
  type: ToolbarFilterType.DateRange,
  key: 'period',
  label: 'Period',
  query: 'period',
  options: [
    { label: 'Last 7 days', value: 'last_7_days' },
    { label: 'Custom', value: 'custom', isCustom: true },
  ],
  placeholder: 'Filter by period',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useExportCsv', () => {
  let fetchSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    const mockBlob = new Blob(['col1,col2\nval1,val2'], { type: 'text/csv' });
    fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(mockBlob, { status: 200 }));
  });

  afterEach(() => {
    vi.useRealTimers();
    fetchSpy.mockRestore();
  });

  // --- Basic ---

  test('should return a function', () => {
    const { result } = renderHook(() => useExportCsv([], {}, {}));
    expect(result.current).toBeTypeOf('function');
  });

  // --- Success path ---

  test('should fetch export endpoint and trigger programmatic download', async () => {
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('summary');
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('dashboard_reports/report/export/'),
      expect.anything()
    );
    expect(mockDownloadBlobFile).toHaveBeenCalledOnce();
  });

  test('should not call window.open', async () => {
    const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => null);
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('summary');
    });

    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  // --- URL building ---

  test('should include report_type param in the URL', async () => {
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('roi');
    });

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain('report_type=roi');
  });

  test('should include export_format=csv param in the URL', async () => {
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('summary');
    });

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain('export_format=csv');
  });

  test('should include queryParams in the URL', async () => {
    const { result } = renderHook(() => useExportCsv([], {}, { period: 'last_7_days' }));

    await act(async () => {
      await result.current('summary');
    });

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain('period=last_7_days');
  });

  test('should include filter state values in the URL', async () => {
    const { result } = renderHook(() => useExportCsv([nameFilter], { name: ['my-template'] }, {}));

    await act(async () => {
      await result.current('summary');
    });

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain('name=my-template');
  });

  test('should include both queryParams and filter state in the URL', async () => {
    const { result } = renderHook(() =>
      useExportCsv([nameFilter], { name: ['ansible'] }, { tz: 'Europe/Ljubljana' })
    );

    await act(async () => {
      await result.current('summary');
    });

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain('tz=Europe%2FLjubljana');
    expect(url).toContain('name=ansible');
  });

  test('should include start_date and end_date in the URL for a custom period filter', async () => {
    const { result } = renderHook(() =>
      useExportCsv([periodFilter], { period: ['custom', '2024-01-01', '2024-01-31'] }, {})
    );

    await act(async () => {
      await result.current('summary');
    });

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain('period=custom');
    expect(url).toContain('start_date=2024-01-01');
    expect(url).toContain('end_date=2024-01-31');
  });

  // --- Filename derivation ---

  test('should use fallback filename with reportType and date when no Content-Disposition header', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('roi');
    });

    expect(mockDownloadBlobFile).toHaveBeenCalledWith(
      'automation-dashboard-roi-2024-06-15',
      'csv',
      expect.any(Blob)
    );
  });

  test('should use filename from plain Content-Disposition header, stripping .csv extension', async () => {
    const headers = new Headers({ 'Content-Disposition': 'attachment; filename="my-export.csv"' });
    const mockBlob = new Blob(['col1'], { type: 'text/csv' });
    fetchSpy.mockResolvedValueOnce(new Response(mockBlob, { status: 200, headers }));
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('summary');
    });

    expect(mockDownloadBlobFile).toHaveBeenCalledWith('my-export', 'csv', expect.any(Blob));
  });

  test('should decode RFC 5987 percent-encoded filename from Content-Disposition', async () => {
    const headers = new Headers({
      'Content-Disposition': "attachment; filename*=UTF-8''my%20report.csv",
    });
    const mockBlob = new Blob(['col1'], { type: 'text/csv' });
    fetchSpy.mockResolvedValueOnce(new Response(mockBlob, { status: 200, headers }));
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('trends');
    });

    expect(mockDownloadBlobFile).toHaveBeenCalledWith('my report', 'csv', expect.any(Blob));
  });

  test('should prefer filename*= over filename= when both are present (RFC 6266)', async () => {
    const headers = new Headers({
      'Content-Disposition':
        'attachment; filename="fallback.csv"; filename*=UTF-8\'\'correct%20name.csv',
    });
    const mockBlob = new Blob(['col1'], { type: 'text/csv' });
    fetchSpy.mockResolvedValueOnce(new Response(mockBlob, { status: 200, headers }));
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('summary');
    });

    expect(mockDownloadBlobFile).toHaveBeenCalledWith('correct name', 'csv', expect.any(Blob));
  });

  test('should handle RFC 5987 filename with non-empty language tag', async () => {
    const headers = new Headers({
      'Content-Disposition': "attachment; filename*=UTF-8'en'my%20report.csv",
    });
    const mockBlob = new Blob(['col1'], { type: 'text/csv' });
    fetchSpy.mockResolvedValueOnce(new Response(mockBlob, { status: 200, headers }));
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('summary');
    });

    expect(mockDownloadBlobFile).toHaveBeenCalledWith('my report', 'csv', expect.any(Blob));
  });

  test('should use plain filename as-is when it contains a literal % (no URIError)', async () => {
    const headers = new Headers({
      'Content-Disposition': 'attachment; filename="50%_hosts.csv"',
    });
    const mockBlob = new Blob(['col1'], { type: 'text/csv' });
    fetchSpy.mockResolvedValueOnce(new Response(mockBlob, { status: 200, headers }));
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('summary');
    });

    expect(mockDownloadBlobFile).toHaveBeenCalledWith('50%_hosts', 'csv', expect.any(Blob));
    expect(mockAddAlert).not.toHaveBeenCalled();
  });

  test('should trim whitespace from filename before use', async () => {
    const headers = new Headers({
      'Content-Disposition': 'attachment; filename="export.csv "',
    });
    const mockBlob = new Blob(['col1'], { type: 'text/csv' });
    fetchSpy.mockResolvedValueOnce(new Response(mockBlob, { status: 200, headers }));
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('summary');
    });

    expect(mockDownloadBlobFile).toHaveBeenCalledWith('export', 'csv', expect.any(Blob));
  });

  // --- Error path ---

  test('should show danger alert when response is not ok', async () => {
    fetchSpy.mockResolvedValue(
      new Response(null, { status: 422, statusText: 'Unprocessable Entity' })
    );
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('summary');
    });

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'danger', title: 'Failed to export CSV.' })
    );
    expect(mockDownloadBlobFile).not.toHaveBeenCalled();
  });

  test('should show danger alert with error message when fetch throws a network error', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('summary');
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
      await result.current('summary');
    });

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'danger', children: 'An unknown error occurred.' })
    );
  });
});
