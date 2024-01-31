import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';

export function useProjectFilters() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name',
        comparison: 'startsWith',
      },
    ],
    [t]
  );
}
