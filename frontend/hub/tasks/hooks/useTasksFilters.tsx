import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';

export function useTasksFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Task name'),
        type: ToolbarFilterType.Text,
        query: 'name__contains',
        comparison: 'contains',
      },
      {
        key: 'status',
        label: t('Status'),
        type: ToolbarFilterType.MultiSelect,
        query: 'state',
        options: [
          { label: t('Completed'), value: 'completed' },
          { label: t('Failed'), value: 'failed' },
          { label: t('Running'), value: 'running' },
          { label: t('Waiting'), value: 'waiting' },
        ],
        placeholder: 'Filter by status',
      },
    ],
    [t]
  );
  return toolbarFilters;
}
