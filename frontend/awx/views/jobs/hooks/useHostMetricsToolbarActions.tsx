import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { DownloadIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HostMetric } from '../../../interfaces/HostMetric';
import { useDeleteHostMetrics } from './useDeleteHostMetrics';
import { useDownloadHostMetrics } from './useDownloadHostMetrics';

export function useHostMetricsToolbarActions(options: {
  onComplete: (host: HostMetric[]) => void;
  listUrl: string;
  itemCount: number | undefined;
}) {
  const { t } = useTranslation();
  const { onComplete, listUrl, itemCount } = options;
  const deleteHostMetrics = useDeleteHostMetrics(onComplete);
  const downloadHostMetrics = useDownloadHostMetrics(listUrl);

  return useMemo<IPageAction<HostMetric>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: DownloadIcon,
        label: t('Download'),
        onClick: () => {
          void downloadHostMetrics();
        },
        isDisabled: !itemCount ? t('No host metrics to download') : undefined,
        ouiaId: 'host-metrics-download-button',
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete hostnames'),
        onClick: deleteHostMetrics,
        isDanger: true,
      },
    ],
    [deleteHostMetrics, downloadHostMetrics, itemCount, t]
  );
}
