import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import { useMemo } from 'react';

export function useEdaTeamFilters() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name',
        comparison: 'startsWith',
      },
    ],
    [t]
  );
}
