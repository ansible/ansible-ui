import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../../framework';
import { HostMetric } from '../../../interfaces/HostMetric';
import { useDeleteHostMetrics } from './useDeleteHostMetrics';

export function useHostMetricsToolbarActions(onComplete: (host: HostMetric[]) => void) {
  const { t } = useTranslation();
  const deleteHostMetrics = useDeleteHostMetrics(onComplete);

  return useMemo<IPageAction<HostMetric>[]>(
    () => [
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected hostnames'),
        onClick: deleteHostMetrics,
        isDanger: true,
      },
    ],
    [deleteHostMetrics, t]
  );
}
