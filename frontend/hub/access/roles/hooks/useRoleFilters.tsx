import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';

export function useRoleFilters() {
  const { t } = useTranslation();

  const toolbarFilters = useMemo(() => {
    const filters: IToolbarFilter[] = [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name__icontains',
        comparison: 'contains',
      },
      {
        key: 'editable',
        label: t('Editable'),
        type: ToolbarFilterType.SingleSelect,
        query: 'managed',
        options: [
          { label: t('Editable'), value: 'false' },
          { label: t('Built-in'), value: 'true' },
        ],
        placeholder: t('Filter by editability'),
      },
    ];
    return filters;
  }, [t]);

  return toolbarFilters;
}
