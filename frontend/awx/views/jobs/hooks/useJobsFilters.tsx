import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import { useNameToolbarFilter } from '../../../common/awx-toolbar-filters';

export function useJobsFilters() {
  const { t } = useTranslation();
  const nameToolbarFilter = useNameToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      {
        key: 'id',
        label: t('ID'),
        type: ToolbarFilterType.Text,
        query: 'id',
        comparison: 'equals',
      },
      {
        key: 'labels__name__icontains',
        label: t('Label name'),
        type: ToolbarFilterType.Text,
        query: 'labels__name__icontains',
        comparison: 'contains',
      },
      {
        key: 'type',
        label: t('Job type'),
        type: ToolbarFilterType.MultiSelect,
        query: 'type',
        options: [
          { label: t('Source control update'), value: 'project_update' },
          { label: t('Inventory sync'), value: 'inventory_update' },
          { label: t('Playbook run'), value: 'job' },
          { label: t('Command'), value: 'ad_hoc_command' },
          { label: t('Management job'), value: 'system_job' },
          { label: t('Workflow job'), value: 'workflow_job' },
        ],
        placeholder: t('Filter by job type'),
      },
      {
        key: 'created_by__username__icontains',
        label: t('Launched by (Username)'),
        type: ToolbarFilterType.Text,
        query: 'created_by__username__icontains',
        comparison: 'contains',
      },
      {
        key: 'status',
        label: t('Status'),
        type: ToolbarFilterType.MultiSelect,
        query: 'status',
        options: [
          { label: t('New'), value: 'new' },
          { label: t('Pending'), value: 'pending' },
          { label: t('Waiting'), value: 'waiting' },
          { label: t('Running'), value: 'running' },
          { label: t('Success'), value: 'successful' },
          { label: t('Failed'), value: 'failed' },
          { label: t('Error'), value: 'error' },
          { label: t('Canceled'), value: 'canceled' },
        ],
        placeholder: t('Filter by status'),
      },
      {
        key: 'job__limit',
        label: t('Limit'),
        type: ToolbarFilterType.Text,
        query: 'job__limit',
        comparison: 'equals',
      },
    ],
    [nameToolbarFilter, t]
  );
  return toolbarFilters;
}
