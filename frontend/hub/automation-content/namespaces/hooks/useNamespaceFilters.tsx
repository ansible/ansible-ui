import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../../framework';

export function useNamespaceFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('Keywords'),
        type: 'string',
        query: 'keywords',
        placeholder: t('starts with'),
      },
    ],
    [t]
  );
  return toolbarFilters;
}
