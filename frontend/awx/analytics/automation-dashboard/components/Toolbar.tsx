import { useAutomationDashboardToolbarFilters } from '../common/useAutomationDashboardToolbarFilters';
import { useMemo } from 'react';
import { IToolbarDateRangeFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';

/**
 * The period filter definition. It is rendered by `AutomationDashboardPeriodFilter` (not by the
 * shared toolbar filters), but the query string, required-filter validation and export still
 * need it, so callers combine it with `useAutomationDashboardToolbar()` for that logic.
 */
export function useAutomationDashboardPeriodFilter(): IToolbarDateRangeFilter {
  const { t } = useTranslation();
  return useMemo<IToolbarDateRangeFilter>(
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
      isRequired: true,
      defaultValue: AutomationDashboardDateRangeFilterPresets.last_7_days,
    }),
    [t]
  );
}

const FILTERABLE_FIELDS = ['template', 'label', 'organization', 'project'];

/** The filters rendered by the dashboard toolbar filters (without the period). */
export function useAutomationDashboardToolbar() {
  return useAutomationDashboardToolbarFilters({ filterableFields: FILTERABLE_FIELDS });
}
