import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useActivationHistoryLogsFilters() {
  const searchFilter = useSearchToolbarFilter();
  return useMemo<IToolbarFilter[]>(() => [searchFilter], [searchFilter]);
}

function useSearchToolbarFilter() {
  const { t } = useTranslation();
  return useMemo(() => {
    const filter: IToolbarFilter = {
      type: ToolbarFilterType.Search,
      key: 'log',
      label: t('Search'),
      query: 'log',
      placeholder: t('Filter by keyword'),
    };
    return filter;
  }, [t]);
}
