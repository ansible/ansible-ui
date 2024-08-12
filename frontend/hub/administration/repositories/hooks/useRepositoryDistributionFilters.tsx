import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';

export function useRepositoryDistributionFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.SingleText,
        query: 'name__icontains',
        comparison: 'contains',
      },
      {
        key: 'base_path',
        label: t('Base path'),
        type: ToolbarFilterType.SingleText,
        query: 'base_path__icontains',
        comparison: 'contains',
      },
    ],
    [t]
  );
}
