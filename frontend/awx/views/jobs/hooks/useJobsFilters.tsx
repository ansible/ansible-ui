import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter } from '../../../../../framework';
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
        type: 'string',
        query: 'id',
        placeholder: t('equals'),
      },
      {
        key: 'labels__name__icontains',
        label: t('Label Name'),
        type: 'string',
        query: 'labels__name__icontains',
        placeholder: t('contains'),
      },
      {
        key: 'type',
        label: t('Job type'),
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
        placeholder: t('Select types'),
      },
      {
        key: 'created_by__username__icontains',
        label: t('Launched by (Username)'),
        type: 'string',
        query: 'created_by__username__icontains',
        placeholder: t('contains'),
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
        placeholder: t('Select statuses'),
      },
      {
        key: 'job__limit',
        label: t('Limit'),
        type: 'string',
        query: 'job__limit',
        placeholder: t('equals'),
      },
    ],
    [nameToolbarFilter, t]
  );
  return toolbarFilters;
}
