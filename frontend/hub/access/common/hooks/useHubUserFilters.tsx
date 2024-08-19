import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import { useMemo } from 'react';

export function useHubUserFilters() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'username',
        label: t('Username'),
        type: ToolbarFilterType.MultiText,
        query: 'username__contains',
        comparison: 'contains',
      },
    ],
    [t]
  );
}
