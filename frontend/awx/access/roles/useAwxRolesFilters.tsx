import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';

export function useAwxRolesFilters() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name__contains',
        comparison: 'contains',
      },
    ],
    [t]
  );
}
