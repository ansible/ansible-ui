import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../../framework';

export function useRemoteRegistryFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      { key: 'name', label: t('Name'), type: 'string', query: 'name', placeholder: 'starts with' },
    ],
    [t]
  );
  return toolbarFilters;
}
