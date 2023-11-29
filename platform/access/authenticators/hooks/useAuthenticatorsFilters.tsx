import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { useMemo } from 'react';

export function useNameToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'name',
      label: t('name'),
      type: ToolbarFilterType.Text,
      query: 'name__contains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useTypeToolbarFilter() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter>(
    () => ({
      key: 'type',
      label: t('Authentication type'),
      type: ToolbarFilterType.Text,
      query: 'type__contains',
      comparison: 'contains',
    }),
    [t]
  );
}

export function useAuthenticatorsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const typeToolbarFilter = useTypeToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [nameToolbarFilter, typeToolbarFilter],
    [nameToolbarFilter, typeToolbarFilter]
  );
  return toolbarFilters;
}
