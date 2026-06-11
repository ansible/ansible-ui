import { DateCell, ITableColumn } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HostMetric } from '../../../interfaces/HostMetric';
import { useHostMetricNameColumn } from './useHostMetricNameColumn';

export function useHostMetricsColumns() {
  const { t } = useTranslation();
  const nameColumn = useHostMetricNameColumn();
  const tableColumns = useMemo<ITableColumn<HostMetric>[]>(
    () => [
      nameColumn,
      {
        header: t('First automated'),
        cell: (host: HostMetric) => <DateCell value={host.first_automation} />,
        sort: 'first_automation',
      },
      {
        header: t('Last automated'),
        cell: (host: HostMetric) => <DateCell value={host.last_automation} />,
        sort: 'last_automation',
      },
      {
        header: t('Automation'),
        type: 'count',
        value: (host) => host.automated_counter,
        sort: 'automated_counter',
      },
      {
        header: t('Deleted'),
        type: 'count',
        value: (host) => host.deleted_counter,
        sort: 'deleted_counter',
      },
    ],
    [nameColumn, t]
  );
  return tableColumns;
}
