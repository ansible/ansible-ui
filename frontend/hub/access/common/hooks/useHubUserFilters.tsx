import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useHubUserFilters() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'username',
        label: t('Username'),
        type: ToolbarFilterType.MultiText,
        query: 'username__icontains',
        comparison: 'contains',
      },
    ],
    [t]
  );
}
