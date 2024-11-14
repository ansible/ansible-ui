import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HostMetric } from '../../../interfaces/HostMetric';
import { useDeleteHostMetrics } from './useDeleteHostMetrics';

export function useHostMetricsRowActions(onComplete: (host: HostMetric[]) => void) {
  const { t } = useTranslation();
  const deleteHostMetrics = useDeleteHostMetrics(onComplete);

  return useMemo<IPageAction<HostMetric>[]>(() => {
    return [
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t(`Delete hostname`),
        onClick: (host: HostMetric) => deleteHostMetrics([host]),
        isDanger: true,
      },
    ];
  }, [deleteHostMetrics, t]);
}
