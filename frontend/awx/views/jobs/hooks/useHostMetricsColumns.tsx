import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { DateCell } from '../../../../../framework';
import { HostMetric } from '../../../interfaces/HostMetric';

export function useHostMetricsColumns() {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<HostMetric>[]>(
    () => [
      {
        header: t('Hostname'),
        cell: (host: HostMetric) => <TextCell text={host.hostname} />,
        sort: 'hostname',
        card: 'name',
        list: 'name',
        defaultSortDirection: 'asc',
        defaultSort: true,
      },
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
    [t]
  );
  return tableColumns;
}
