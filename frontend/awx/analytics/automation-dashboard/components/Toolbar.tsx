import { useAutomationDashboardToolbarFilters } from '../common/useAutomationDashboardToolbarFilters';
import { useMemo } from 'react';
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';

export function useAutomationDashboardToolbar() {
  const { t } = useTranslation();
  const periodToolbarFilter: IToolbarFilter = useMemo<IToolbarFilter>(
    () => ({
      type: ToolbarFilterType.SingleSelect,
      key: 'period',
      label: t('Period'),
      query: 'period',
      options: [
        { label: t('Month to date'), value: AutomationDashboardDateRangeFilterPresets.monthToDate },
        { label: t('Past month'), value: AutomationDashboardDateRangeFilterPresets.pastMonth },
        {
          label: t('Quarter to date'),
          value: AutomationDashboardDateRangeFilterPresets.quarterToDate,
        },
        { label: t('Past 3 months'), value: AutomationDashboardDateRangeFilterPresets.past3Months },
        { label: t('Past 6 months'), value: AutomationDashboardDateRangeFilterPresets.past6Months },
        { label: t('Year to date'), value: AutomationDashboardDateRangeFilterPresets.yearToDate },
        { label: t('Past year'), value: AutomationDashboardDateRangeFilterPresets.pastYear },
        { label: t('Past 2 years'), value: AutomationDashboardDateRangeFilterPresets.past2Years },
        { label: t('Past 3 years'), value: AutomationDashboardDateRangeFilterPresets.past3Years },
      ],
      placeholder: t('Filter by period'),
      isPinned: true,
      isRequired: true,
      disableSortOptions: true,
      defaultValue: 'month_to_date',
    }),
    [t]
  );

  return useAutomationDashboardToolbarFilters({
    filterableFields: ['template', 'label', 'organization', 'project'],
    additionalFilters: [periodToolbarFilter],
  });
}
