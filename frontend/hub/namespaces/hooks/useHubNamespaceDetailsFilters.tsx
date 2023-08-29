import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';

export function useHubNamespaceDetailsFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'repository_name__icontains',
        label: t('Repository'),
        type: ToolbarFilterType.Text,
        query: 'repository_name__icontains',
        comparison: 'contains',
      },
    ],
    [t]
  );
  return toolbarFilters;
}
