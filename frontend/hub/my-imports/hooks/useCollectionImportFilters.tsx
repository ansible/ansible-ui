import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';

export function useCollectionImportFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.SingleText,
        query: 'name',
        comparison: 'contains',
        placeholder: t('Filter by name'),
      },
      {
        key: 'status',
        label: t('Status'),
        type: ToolbarFilterType.SingleSelect,
        options: [
          { label: t('Completed'), value: 'completed' },
          { label: t('Failed'), value: 'failed' },
          { label: t('Running'), value: 'running' },
          { label: t('Waiting'), value: 'waiting' },
        ],
        placeholder: t('Filter by status'),
        query: 'status',
      },
      {
        key: 'version',
        label: t('Version'),
        type: ToolbarFilterType.SingleText,
        query: 'version',
        comparison: 'equals',
        placeholder: t('Filter by version'),
      },
    ],
    [t]
  );
  return toolbarFilters;
}
