import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';

export function useTokensFilters() {
  const nameToolbarFilter = useTokenUserToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(() => [nameToolbarFilter], [nameToolbarFilter]);
  return toolbarFilters;
}

function useTokenUserToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'name',
      label: t('Name'),
      type: ToolbarFilterType.MultiText,
      query: 'user__username__icontains',
      comparison: 'contains',
    }),
    [t]
  );
}
