import { IToolbarFilter } from '../../../../../framework';
import { useNameToolbarFilter } from '../../../common/controller-toolbar-filters';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useJobsFilters() {
  const { t } = useTranslation();
  const nameToolbarFilter = useNameToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      {
        key: 'id',
        label: t('ID'),
        type: 'string',
        query: 'id',
      },
      {
        key: 'labels__name__icontains',
        label: t('Label Name'),
        type: 'string',
        query: 'labels__name__icontains',
      },
      {
        key: 'type',
        label: t('Job Type'),
        type: 'select',
        query: 'type',
        options: [
          { label: t('Source Control Update'), value: 'project_update' },
          { label: t('Inventory Sync'), value: 'inventory_update' },
          { label: t('Playbook Run'), value: 'job' },
          { label: t('Command'), value: 'ad_hoc_command' },
          { label: t('Management Job'), value: 'system_job' },
          { label: t('Workflow Job'), value: 'workflow_job' },
        ],
        placeholder: t('Filter By Job Type'),
      },
      {
        key: 'created_by__username__icontains',
        label: t('Launched By (Username)'),
        type: 'string',
        query: 'created_by__username__icontains',
      },
      {
        key: 'status',
        label: t('Status'),
        type: 'select',
        query: 'status',
        options: [
          { label: t('New'), value: 'new' },
          { label: t('Pending'), value: 'pending' },
          { label: t('Waiting'), value: 'waiting' },
          { label: t('Running'), value: 'running' },
          { label: t('Successful'), value: 'successful' },
          { label: t('Failed'), value: 'failed' },
          { label: t('Error'), value: 'error' },
          { label: t('Canceled'), value: 'canceled' },
        ],
        placeholder: t('Filter By Status'),
      },
      {
        key: 'job__limit',
        label: t('Limit'),
        type: 'string',
        query: 'job__limit',
      },
    ],
    [nameToolbarFilter, t]
  );
  return toolbarFilters;
}
