import { IToolbarFilter } from '../../../../../framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useHostMetricsFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'hostname__icontains',
        label: t('Hostname'),
        type: 'string',
        query: 'hostname__icontains',
        placeholder: t('contains'),
      },
    ],
    [t]
  );
  return toolbarFilters;
}
