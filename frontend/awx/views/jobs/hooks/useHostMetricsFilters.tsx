import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useHostMetricsFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'hostname__icontains',
        label: t('Hostname contains'),
        type: ToolbarFilterType.SingleText,
        query: 'hostname__icontains',
        comparison: 'contains',
      },
      {
        key: 'hostname__iregex',
        label: t('Hostname (iregex)'),
        type: ToolbarFilterType.SingleText,
        query: 'hostname__iregex',
        comparison: 'iregex',
      },
    ],
    [t]
  );
  return toolbarFilters;
}
