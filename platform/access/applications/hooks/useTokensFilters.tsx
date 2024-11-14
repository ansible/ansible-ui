import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
