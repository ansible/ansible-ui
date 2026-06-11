import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useUserFilters() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Username'),
        type: ToolbarFilterType.MultiText,
        query: 'name',
        comparison: 'startsWith',
      },
    ],
    [t]
  );
}
