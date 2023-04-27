import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { HostMetric } from '../../../interfaces/HostMetric';
import { useDeleteHostMetrics } from './useDeleteHostMetrics';

export function useHostMetricsRowActions(onComplete: (host: HostMetric[]) => void) {
  const { t } = useTranslation();
  const deleteHostMetrics = useDeleteHostMetrics(onComplete);

  return useMemo<IPageAction<HostMetric>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t(`Delete hostname`),
        onClick: (host: HostMetric) => deleteHostMetrics([host]),
      },
    ];
  }, [deleteHostMetrics, t]);
}
