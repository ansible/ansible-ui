import { useAutomationDashboardToolbarFilters } from '../common/useAutomationDashboardToolbarFilters';
import { useMemo } from 'react';
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';

export function useAutomationDashboardToolbar() {
  const { t } = useTranslation();
  const periodToolbarFilter: IToolbarFilter = useMemo<IToolbarFilter>(
    () => ({
      type: ToolbarFilterType.DateRange,
      key: 'period',
      label: t('Period'),
      query: 'period',
      options: [
        { label: t('Last 7 days'), value: AutomationDashboardDateRangeFilterPresets.last_7_days },
        { label: t('Last 14 days'), value: AutomationDashboardDateRangeFilterPresets.last_14_days },
        {
          label: t('Last 30 days'),
          value: AutomationDashboardDateRangeFilterPresets.last_30_days,
        },
        {
          label: t('Last 60 days'),
          value: AutomationDashboardDateRangeFilterPresets.last_60_days,
        },
        {
          label: t('Last 90 days'),
          value: AutomationDashboardDateRangeFilterPresets.last_90_days,
        },
        {
          label: t('Custom'),
          value: AutomationDashboardDateRangeFilterPresets.custom,
          isCustom: true,
        },
      ],
      placeholder: t('Filter by period'),
      isPinned: true,
      isRequired: true,
      disableSortOptions: true,
      defaultValue: AutomationDashboardDateRangeFilterPresets.last_7_days,
    }),
    [t]
  );

  return useAutomationDashboardToolbarFilters({
    filterableFields: ['template', 'label', 'organization', 'project'],
    additionalFilters: [periodToolbarFilter],
  });
}
