import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';

export function useRoleFilters() {
  const { t } = useTranslation();

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name__contains',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name__icontains',
        comparison: 'contains',
      },
      {
        key: 'editable',
        label: t('Editable'),
        type: ToolbarFilterType.SingleSelect,
        query: 'locked',
        options: [
          { label: t('Editable'), value: 'false' },
          { label: t('Built-in'), value: 'true' },
        ],
        placeholder: t('Filter by editability'),
      },
      {
        key: 'type',
        label: t('Role type'),
        type: ToolbarFilterType.SingleSelect,
        query: 'name__startswith',
        options: [
          { label: t('Galaxy-only roles'), value: 'galaxy.' },
          { label: t('All roles'), value: '' },
        ],
        placeholder: t('Filter by role type'),
      },
    ],
    [t]
  );
  return toolbarFilters;
}
