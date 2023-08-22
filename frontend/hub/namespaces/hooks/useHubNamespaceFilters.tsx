import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';

export function useHubNamespaceFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name__icontains',
        label: t('Name'),
        type: ToolbarFilterType.Text,
        query: 'name__icontains',
        comparison: 'contains',
      },
    ],
    [t]
  );
  return toolbarFilters;
}
