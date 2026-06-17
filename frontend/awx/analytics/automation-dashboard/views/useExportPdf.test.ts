/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, MockInstance, test, vi } from 'vitest';
import { useExportPdf } from './useExportPdf';

describe('useExportPdf', () => {
  let openSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  test('should return a function', () => {
    const { result } = renderHook(() => useExportPdf([], {}, {}));
    expect(result.current).toBeTypeOf('function');
  });

  test('should open a new tab with the HTML export URL when invoked', () => {
    const { result } = renderHook(() => useExportPdf([], {}, {}));
    result.current();
    expect(openSpy).toHaveBeenCalledOnce();
    const [url, target] = openSpy.mock.calls[0] as [string, string];
    expect(url).toContain('export_format=html');
    expect(url).toContain('report_type=summary');
    expect(url).toContain('dashboard_reports/report/export/');
    expect(target).toBe('_blank');
  });

  test('should include queryParams in the export URL', () => {
    const { result } = renderHook(() => useExportPdf([], {}, { period: 'last_7_days' }));
    result.current();
    const [url] = openSpy.mock.calls[0] as [string];
    expect(url).toContain('period=last_7_days');
  });

  test('should attach a load listener that calls print on the new window', () => {
    const mockPrint = vi.fn();
    const mockNewWindow = {
      addEventListener: vi.fn(),
      print: mockPrint,
    };
    openSpy.mockReturnValue(mockNewWindow as unknown as Window);

    const { result } = renderHook(() => useExportPdf([], {}, {}));
    result.current();

    expect(mockNewWindow.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));

    const [, loadHandler] = mockNewWindow.addEventListener.mock.calls[0] as [string, () => void];
    loadHandler();
    expect(mockPrint).toHaveBeenCalled();
  });

  test('should not throw when window.open returns null (popup blocked)', () => {
    openSpy.mockReturnValue(null);
    const { result } = renderHook(() => useExportPdf([], {}, {}));
    expect(() => result.current()).not.toThrow();
  });
});
