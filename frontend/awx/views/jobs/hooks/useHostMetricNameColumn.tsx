import { ITableColumn } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HostMetric } from '../../../interfaces/HostMetric';

export function useHostMetricNameColumn(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const nameColumn = useMemo<ITableColumn<HostMetric>>(
    () => ({
      header: t('Hostname'),
      type: 'text',
      value: (host) => host.hostname,
      sort: 'hostname',
      card: 'name',
      list: 'name',
      defaultSortDirection: 'asc',
      defaultSort: true,
    }),
    [t]
  );
  return nameColumn;
}
