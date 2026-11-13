import { PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HostMetric } from '../../../interfaces/HostMetric';
import { useDeleteHostMetrics } from './useDeleteHostMetrics';
import { useDownloadHostMetrics } from './useDownloadHostMetrics';
import { useHostMetricsToolbarActions } from './useHostMetricsToolbarActions';

vi.mock('./useDeleteHostMetrics');
vi.mock('./useDownloadHostMetrics');

describe('useHostMetricsToolbarActions', () => {
  const deleteHostMetrics = vi.fn();
  const downloadHostMetrics = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteHostMetrics).mockReturnValue(deleteHostMetrics);
    vi.mocked(useDownloadHostMetrics).mockReturnValue({
      downloadHostMetrics,
      isDownloading: false,
    });
  });

  it('should expose download and delete toolbar actions', () => {
    const { result } = renderHook(() =>
      useHostMetricsToolbarActions({
        onComplete: vi.fn(),
        listUrl: '/api/v2/host_metrics/',
        itemCount: 2,
      })
    );

    expect(result.current).toHaveLength(2);
    const downloadAction = result.current[0];
    expect(downloadAction.type).toBe(PageActionType.Button);
    if ('selection' in downloadAction) {
      expect(downloadAction.selection).toBe(PageActionSelection.None);
    }
    if ('label' in downloadAction) {
      expect(downloadAction.label).toBe('Download');
    }

    if ('onClick' in downloadAction && typeof downloadAction.onClick === 'function') {
      (downloadAction.onClick as () => void)();
    }
    expect(downloadHostMetrics).toHaveBeenCalled();

    const deleteAction = result.current[1];
    if ('selection' in deleteAction) {
      expect(deleteAction.selection).toBe(PageActionSelection.Multiple);
    }
    if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      (deleteAction.onClick as (items: HostMetric[]) => void)([{ id: 1 } as HostMetric]);
    }
    expect(deleteHostMetrics).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('should disable download when item count is zero', () => {
    const { result } = renderHook(() =>
      useHostMetricsToolbarActions({
        onComplete: vi.fn(),
        listUrl: '/api/v2/host_metrics/',
        itemCount: 0,
      })
    );

    const downloadAction = result.current[0];
    if ('isDisabled' in downloadAction) {
      expect(downloadAction.isDisabled).toBe('No host metrics to download');
    }
  });

  it('should disable download while a download is in progress', () => {
    vi.mocked(useDownloadHostMetrics).mockReturnValue({
      downloadHostMetrics,
      isDownloading: true,
    });

    const { result } = renderHook(() =>
      useHostMetricsToolbarActions({
        onComplete: vi.fn(),
        listUrl: '/api/v2/host_metrics/',
        itemCount: 5,
      })
    );

    const downloadAction = result.current[0];
    if ('isDisabled' in downloadAction) {
      expect(downloadAction.isDisabled).toBe('Download in progress');
    }
  });
});
