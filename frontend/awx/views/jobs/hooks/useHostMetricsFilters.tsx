import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../../framework';

export function useHostMetricsFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'hostname__icontains',
        label: t('Hostname'),
        type: 'string',
        query: 'hostname__icontains',
        comparison: 'contains',
      },
    ],
    [t]
  );
  return toolbarFilters;
}
