import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../../common/awx-toolbar-filters';

export function useJobsFilters() {
  const { t } = useTranslation();
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      {
        key: 'status',
        label: t('Status'),
        type: ToolbarFilterType.MultiSelect,
        query: 'status__exact',
        placeholder: t('Filter by status'),
        options: [
          { label: t('Success'), value: 'successful' },
          { label: t('Failed'), value: 'failed' },
          { label: t('Errors'), value: 'error' },
          { label: t('Canceled'), value: 'canceled' },
          { label: t('Missing'), value: 'missing' },
          { label: t('Pending'), value: 'pending' },
          { label: t('Running'), value: 'running' },
          { label: t('Waiting'), value: 'waiting' },
          { label: t('New'), value: 'new' },
          { label: t('Never updated'), value: 'never updated' },
          { label: t('OK'), value: 'ok' },
        ],
      },
      {
        key: 'type',
        label: t('Type'),
        type: ToolbarFilterType.MultiSelect,
        query: 'scm_type',
        options: [
          { label: t('Manual'), value: '' },
          { label: t('Git'), value: 'git' },
          { label: t('Subversion'), value: 'svn' },
          { label: t('Remote archive'), value: 'archive' },
          { label: t('Red Hat insights'), value: 'insights' },
        ],
        placeholder: t('Select types'),
      },
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [
      nameToolbarFilter,
      descriptionToolbarFilter,
      t,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ]
  );
  return toolbarFilters;
}
