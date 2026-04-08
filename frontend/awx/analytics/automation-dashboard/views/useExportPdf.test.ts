/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, MockInstance, test, vi } from 'vitest';
import { useExportPdf } from './useExportPdf';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockPostRequest, mockAddAlert, mockSvgToPng } = vi.hoisted(() => ({
  mockPostRequest: vi.fn(),
  mockAddAlert: vi.fn(),
  mockSvgToPng: vi.fn(),
}));

vi.mock('../../../../common/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => mockPostRequest),
}));

vi.mock('../../../../../framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../framework')>();
  return { ...actual, usePageAlertToaster: vi.fn(() => ({ addAlert: mockAddAlert })) };
});

vi.mock('../utils/svgToPng', () => ({
  svgToPng: mockSvgToPng,
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useExportPdf', () => {
  let createObjectUrlSpy: MockInstance;
  let revokeObjectUrlSpy: MockInstance;
  let mockBlob: Blob;
  let chartContainer: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();

    mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
    mockPostRequest.mockResolvedValue(mockBlob);
    mockSvgToPng.mockResolvedValue('data:image/png;base64,abc123');

    createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    chartContainer = document.createElement('div');
    chartContainer.innerHTML = `
      <div id="job-chart-card">
        <div class="pf-v6-c-chart"><svg></svg></div>
      </div>
      <div id="host-chart-card">
        <div class="pf-v6-c-chart"><svg></svg></div>
      </div>`;
    document.body.appendChild(chartContainer);
  });

  afterEach(() => {
    vi.useRealTimers();
    createObjectUrlSpy.mockRestore();
    revokeObjectUrlSpy.mockRestore();
    if (document.body.contains(chartContainer)) {
      chartContainer.remove();
    }
  });

  // --- Basic ---

  test('should return a function', () => {
    const { result } = renderHook(() => useExportPdf([], {}, {}));
    expect(result.current).toBeTypeOf('function');
  });

  // --- Success path ---

  test('should POST PNG data to PDF endpoint and trigger download when SVGs are present', async () => {
    const { result } = renderHook(() => useExportPdf([], {}, {}));

    await act(async () => {
      await result.current();
    });

    expect(mockPostRequest).toHaveBeenCalledOnce();
    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('dashboard_reports/report/pdf/'),
      { job_chart: 'data:image/png;base64,abc123', host_chart: 'data:image/png;base64,abc123' }
    );
    expect(createObjectUrlSpy).toHaveBeenCalledWith(mockBlob);

    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  test('should include queryParams in the PDF URL', async () => {
    const { result } = renderHook(() => useExportPdf([], {}, { period: 'last_7_days' }));

    await act(async () => {
      await result.current();
    });

    const [url] = mockPostRequest.mock.calls[0] as [string, unknown];
    expect(url).toContain('period=last_7_days');
  });

  // --- Null SVG branch ---

  test('should pass null to svgToPng when chart elements are absent from DOM', async () => {
    chartContainer.remove();

    const { result } = renderHook(() => useExportPdf([], {}, {}));

    await act(async () => {
      await result.current();
    });

    expect(mockSvgToPng).toHaveBeenCalledWith(null);
  });

  // --- Error path ---

  test('should show danger alert with error message when postRequest throws an Error', async () => {
    mockPostRequest.mockRejectedValue(new Error('PDF generation failed'));
    const { result } = renderHook(() => useExportPdf([], {}, {}));

    await act(async () => {
      await result.current();
    });

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to export PDF.',
        children: 'PDF generation failed',
      })
    );
  });

  test('should show danger alert with children: undefined when thrown value is not an Error', async () => {
    mockPostRequest.mockRejectedValue('string error');
    const { result } = renderHook(() => useExportPdf([], {}, {}));

    await act(async () => {
      await result.current();
    });

    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        children: undefined,
      })
    );
  });
});
