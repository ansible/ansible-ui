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

const templateFilter: IToolbarFilter = {
  type: ToolbarFilterType.AsyncMultiSelect,
  key: 'template',
  label: 'Template',
  query: 'template',
  placeholder: 'Select template',
  queryOptions: vi.fn(),
  queryLabel: (value: string) => value,
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

const EXPORT_FAILED = 'Failed to export CSV.';

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
      expect.stringContaining('dashboard_reports/report/export/query/'),
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

  // --- Request ---

  /** The url, method and JSON body of the export request. */
  function getRequest() {
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    return { url, method: init.method, body: JSON.parse(init.body as string) as unknown };
  }

  test('should post the report type and the CSV format to the export query endpoint', async () => {
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('roi');
    });

    expect(getRequest()).toEqual({
      url: expect.stringMatching(/dashboard_reports\/report\/export\/query\/$/) as unknown,
      method: 'POST',
      body: { report_type: 'roi', export_format: 'csv' },
    });
  });

  test('should send the query params, the period and the selection in the body', async () => {
    const { result } = renderHook(() =>
      useExportCsv(
        [periodFilter, templateFilter],
        {
          period: ['custom', '2024-01-01', '2024-01-31'],
          select_all_template: ['true'],
          excluded_template: ['4'],
        },
        { tz: 'Europe/Ljubljana' }
      )
    );

    await act(async () => {
      await result.current('summary');
    });

    expect(getRequest().body).toEqual({
      tz: 'Europe/Ljubljana',
      period: 'custom',
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      select_all_template: true,
      excluded_template: [4],
      report_type: 'summary',
      export_format: 'csv',
    });
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
      expect.objectContaining({ variant: 'danger', title: EXPORT_FAILED })
    );
    expect(mockDownloadBlobFile).not.toHaveBeenCalled();
  });

  test.each([431, 414, 413])(
    'should ask to narrow the filters when the export is rejected as too large (%s)',
    async (status) => {
      fetchSpy.mockResolvedValue(new Response(null, { status }));
      const { result } = renderHook(() => useExportCsv([], {}, {}));

      await act(async () => {
        await result.current('summary');
      });

      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'danger',
          title: EXPORT_FAILED,
          children: expect.stringContaining('Narrow the filters') as unknown,
        })
      );
    }
  );

  test('should show the status of other failed exports', async () => {
    fetchSpy.mockResolvedValue(
      new Response(null, { status: 422, statusText: 'Unprocessable Entity' })
    );
    const { result } = renderHook(() => useExportCsv([], {}, {}));

    await act(async () => {
      await result.current('summary');
    });

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({ children: '422 Unprocessable Entity' })
    );
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
        title: EXPORT_FAILED,
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
