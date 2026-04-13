import { IFilterState, PageToolbar, PageToolbarProps } from '@ansible/ansible-ui-framework';
import { PageAsyncSingleSelect } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSingleSelect';
import { Flex, FlexItem } from '@patternfly/react-core';
import { useCallback } from 'react';
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

export function DashboardToolbar(props: PageToolbarProps<IJobTemplate>) {
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
  const { setFilterState, filterState } = props;

  const applyFilterSet = useCallback(
    (filterSet: IDashboardFilterSet) => {
      setSelectedFilterSet(filterSet);
      setFilterState?.(parseFilterState(filterSet.filters));
    },
    [setSelectedFilterSet, setFilterState]
  );

  const onCreate = useCallback(
    (newFilterSet: IDashboardFilterSet) => {
      upsertFilterSet(newFilterSet);
      applyFilterSet(newFilterSet);
    },
    [upsertFilterSet, applyFilterSet]
  );

  const onUpdate = useCallback(
    (filterSet: IDashboardFilterSet) => {
      upsertFilterSet(filterSet);
      applyFilterSet(filterSet);
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
    onUpdate,
    onCreate,
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

  return (
    <Flex alignItems={{ default: 'alignItemsFlexStart' }} style={{ marginLeft: '1.5rem' }}>
      <FlexItem style={{ marginRight: '-1rem', paddingBottom: '1rem', minWidth: '180px' }}>
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
      </FlexItem>
      <FlexItem>
        <PageToolbar {...props} toolbarActions={toolbarActions} />
      </FlexItem>
    </Flex>
  );
}
