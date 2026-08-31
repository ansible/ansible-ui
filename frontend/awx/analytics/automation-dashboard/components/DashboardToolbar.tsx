import {
  IFilterState,
  PageActions,
  PageToolbarFilters,
  PageToolbarProps,
  useBreakpoint,
} from '@ansible/ansible-ui-framework';
import { PageAsyncSingleSelect } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSingleSelect';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  yyyyMMddFormat,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutomationDashboardToolbarActions } from '../common/useAutomationDashboardToolbarActions';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';
import { IDashboardFilterSet, IJobTemplate } from '../types';
import { useFilterSetView } from '../views/useFilterSetView';
import { isFilterStateShape } from '../utils/persistedFilterState';

const DEFAULT_FILTER_STATE: IFilterState = {
  period: [AutomationDashboardDateRangeFilterPresets.last_7_days],
};

const CUSTOM_RANGE_DEFAULT_FROM_DAYS = 7;

function getDefaultCustomFrom(): string {
  const date = new Date();
  date.setDate(date.getDate() - CUSTOM_RANGE_DEFAULT_FROM_DAYS);
  return yyyyMMddFormat(date);
}

function parseFilterState(raw: string): IFilterState {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isFilterStateShape(parsed)) {
      return parsed;
    }
  } catch {
    return DEFAULT_FILTER_STATE;
  }
  return DEFAULT_FILTER_STATE;
}

export function DashboardToolbar(
  props: Readonly<
    PageToolbarProps<IJobTemplate> & {
      registerClearCallback?: (callback: () => void) => void;
    }
  >
) {
  const { t } = useTranslation();
  const {
    value,
    version,
    setValue,
    queryOptions,
    filterSets,
    setSelectedFilterSet,
    selectedFilterSet,
    removeFilterSet,
    upsertFilterSet,
  } = useFilterSetView();

  const { setFilterState, filterState, registerClearCallback, clearAllFilters, toolbarFilters } =
    props;

  // Register callback to reset dropdown when clearAllFilters is called
  useEffect(() => {
    registerClearCallback?.(() => {
      setValue(undefined);
      setSelectedFilterSet(undefined);
    });
  }, [registerClearCallback, setValue, setSelectedFilterSet]);

  // When the user switches the period filter to Custom with no dates yet, seed the
  // start date to 7 days ago (matching "Last 7 days") instead of leaving it empty.
  // Only fires on the transition into Custom, so manually clearing the start date
  // afterwards isn't immediately overwritten.
  const previousPeriodPresetRef = useRef<string | undefined>(filterState?.period?.[0]);
  useEffect(() => {
    const period = filterState?.period;
    const currentPreset = period?.[0];
    const enteringCustom =
      currentPreset === AutomationDashboardDateRangeFilterPresets.custom &&
      previousPeriodPresetRef.current !== AutomationDashboardDateRangeFilterPresets.custom;
    previousPeriodPresetRef.current = currentPreset;

    if (enteringCustom && period?.length === 1) {
      setFilterState?.((prev) => ({
        ...prev,
        period: [AutomationDashboardDateRangeFilterPresets.custom, getDefaultCustomFrom()],
      }));
    }
  }, [filterState?.period, setFilterState]);

  const applyFilterSet = useCallback(
    (filterSet: IDashboardFilterSet) => {
      setSelectedFilterSet(filterSet);
      setFilterState?.(parseFilterState(filterSet.filters));
    },
    [setSelectedFilterSet, setFilterState]
  );

  const onSave = useCallback(
    (newFilterSet: IDashboardFilterSet) => {
      upsertFilterSet(newFilterSet);
      applyFilterSet(newFilterSet);
    },
    [upsertFilterSet, applyFilterSet]
  );

  const onFilterSetDelete = useCallback(
    (deletedFilterSet: IDashboardFilterSet) => {
      removeFilterSet(deletedFilterSet);
      setFilterState?.(DEFAULT_FILTER_STATE);
    },
    [removeFilterSet, setFilterState]
  );

  const toolbarActions = useAutomationDashboardToolbarActions({
    filterState,
    toolbarFilters,
    selectedFilterSet,
    onDelete: onFilterSetDelete,
    onSave,
  });

  const onSelect = useCallback(
    (selectedValue: string | null) => {
      setValue(selectedValue ?? undefined);
      const filterset = filterSets.find((fs) => String(fs.id) === selectedValue);
      setSelectedFilterSet(filterset);
      setFilterState?.(
        filterset?.filters ? parseFilterState(filterset.filters) : DEFAULT_FILTER_STATE
      );
    },
    [setValue, filterSets, setSelectedFilterSet, setFilterState]
  );

  const queryLabel = useCallback(
    (val: string) => {
      const fs = filterSets.find((f) => String(f.id) === val);
      return <>{fs?.name ?? val}</>;
    },
    [filterSets]
  );
  const isMdOrLarger = useBreakpoint('md');

  return (
    <Toolbar
      ouiaId="page-toolbar"
      data-testid="page-toolbar"
      clearAllFilters={clearAllFilters}
      className="page-table-toolbar"
      style={{
        paddingBottom: isMdOrLarger ? undefined : 8,
        paddingTop: isMdOrLarger ? undefined : 8,
      }}
      inset={{
        default: 'insetMd',
        sm: 'insetMd',
        md: 'insetMd',
        lg: 'insetMd',
        xl: 'insetLg',
        '2xl': 'insetLg',
      }}
    >
      <ToolbarContent>
        <div
          style={{
            minWidth: '180px',
          }}
        >
          <PageAsyncSingleSelect
            key={String(version)}
            id={'filterset-select'}
            placeholder={t('Select report')}
            value={value}
            queryLabel={queryLabel}
            queryOptions={queryOptions}
            onSelect={onSelect}
            queryErrorText={t('Error loading report options')}
          />
        </div>
        {filterState && setFilterState && (
          <PageToolbarFilters
            toolbarFilters={props.toolbarFilters}
            filterState={filterState}
            setFilterState={setFilterState}
          />
        )}
        <ToolbarGroup variant="action-group">
          <PageActions
            dropDownAriaLabel="toolbar actions"
            actions={toolbarActions}
            wrapper={ToolbarItem}
          />
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
}
