import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../framework';

export function useRemoteFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: 'string',
        query: 'name__icontains',
        comparison: 'contains',
      },
    ],
    [t]
  );

  return toolbarFilters;
}
