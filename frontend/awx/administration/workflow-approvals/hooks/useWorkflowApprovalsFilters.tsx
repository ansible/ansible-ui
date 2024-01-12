import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import { useNameToolbarFilter } from '../../../common/awx-toolbar-filters';

export function useWorkflowApprovalsFilters() {
  const { t } = useTranslation();
  const nameToolbarFilter = useNameToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      {
        type: ToolbarFilterType.MultiSelect,
        key: 'status',
        label: t('Status'),
        query: 'status',
        options: [
          { label: t('Approved'), value: 'successful' },
          { label: t('Denied'), value: 'failed' },
          { label: t('Pending'), value: 'pending' },
          { label: t('Canceled'), value: 'canceled' },
        ],
        placeholder: t('Filter by status'),
      },
      {
        key: 'id',
        label: t('ID'),
        type: ToolbarFilterType.Text,
        query: 'id',
        comparison: 'equals',
      },
    ],
    [nameToolbarFilter, t]
  );
  return toolbarFilters;
}
