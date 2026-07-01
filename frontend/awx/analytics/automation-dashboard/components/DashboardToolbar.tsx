import {
  IFilterState,
  PageActions,
  PageToolbarFilters,
  PageToolbarProps,
  useBreakpoint,
} from '@ansible/ansible-ui-framework';
import { PageAsyncSingleSelect } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSingleSelect';
import { Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutomationDashboardToolbarActions } from '../common/useAutomationDashboardToolbarActions';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';
import { IDashboardFilterSet, IJobTemplate } from '../types';
import { useFilterSetView } from '../views/useFilterSetView';

const DEFAULT_FILTER_STATE: IFilterState = {
  period: [AutomationDashboardDateRangeFilterPresets.last_7_days],
};

function parseFilterState(raw: string): IFilterState {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      Object.values(parsed as Record<string, unknown>).every(
        (v) => Array.isArray(v) && v.every((entry) => typeof entry === 'string')
      )
    ) {
      return parsed as IFilterState;
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

  const { setFilterState, filterState, registerClearCallback, clearAllFilters } = props;

  // Register callback to reset dropdown when clearAllFilters is called
  useEffect(() => {
    registerClearCallback?.(() => {
      setValue(undefined);
      setSelectedFilterSet(undefined);
    });
  }, [registerClearCallback, setValue, setSelectedFilterSet]);

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
