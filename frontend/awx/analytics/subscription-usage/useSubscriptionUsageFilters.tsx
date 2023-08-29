import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';

export function useSubscriptionUsageFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'dateRange',
        label: t('Period'),
        type: ToolbarFilterType.SingleSelect,
        query: 'dateRange',
        options: [
          { label: t('Past year'), value: 'year' },
          { label: t('Past two years'), value: 'two_years' },
          { label: t('Past three years'), value: 'three_years' },
        ],
        placeholder: t('Select period'),
        isPinned: true,
        isRequired: true,
        defaultValue: 'year',
      },
    ],
    [t]
  );
  return toolbarFilters;
}
