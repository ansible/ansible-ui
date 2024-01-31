/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { useState } from 'react';
import { idKeyFn } from '../../../frontend/common/utils/nameKeyFn';
import { PageToolbar } from '../PageToolbar';
import {
  IFilterState,
  IToolbarFilter,
  PageToolbarFiltersProps,
  ToolbarFilterType,
} from '../PageToolbarFilter';
import { IToolbarDateRangeFilter } from './ToolbarDateRangeFilter';
import { IToolbarMultiSelectFilter } from './ToolbarMultiSelectFilter';
import { IToolbarSingleSelectFilter } from './ToolbarSingleSelectFilter';
import { IToolbarMultiTextFilter, IToolbarSingleTextFilter } from './ToolbarTextFilter';

function ToolbarFiltersTest(
  props: Omit<PageToolbarFiltersProps, 'filterState' | 'setFilterState'>
) {
  const [filterState, setFilterState] = useState<IFilterState>({});
  const clearAllFilters = () =>
    setFilterState((_filters) => ({
      // date: filters.date
    }));
  return (
    <>
      <PageToolbar
        keyFn={idKeyFn}
        itemCount={1}
        page={1}
        perPage={10}
        {...props}
        filterState={filterState}
        setFilterState={setFilterState}
        disablePagination
        clearAllFilters={clearAllFilters}
      />
      <PageSection>
        Filter State:
        <pre>{JSON.stringify(filterState, undefined, '  ')}</pre>
      </PageSection>
    </>
  );
}

function createSingleTextFilter(
  index: number,
  options?: { isPinned?: boolean; isRequired?: boolean }
) {
  const singleTextFilter: IToolbarSingleTextFilter = {
    type: ToolbarFilterType.SingleText,
    key: `st${index}`,
    query: `st${index}`,
    label: `Single-Text ${index}`,
    placeholder: `Filter by st${index}`,
    comparison: 'contains',
    ...options,
  };
  return singleTextFilter;
}

function createMultiTextFilter(
  index: number,
  options?: { isPinned?: boolean; isRequired?: boolean }
) {
  const multiTextFilter: IToolbarMultiTextFilter = {
    type: ToolbarFilterType.MultiText,
    key: `mt${index}`,
    query: `mt${index}`,
    label: `Multi-Text ${index}`,
    placeholder: `Filter by mt${index}`,
    comparison: 'contains',
    ...options,
  };
  return multiTextFilter;
}

function createSingleSelectFilter(
  index: number,
  options?: { isPinned?: boolean; isRequired?: boolean }
) {
  const singleSelectFilter: IToolbarSingleSelectFilter = {
    type: ToolbarFilterType.SingleSelect,
    key: `ss${index}`,
    query: `ss${index}`,
    label: `Single-Select ${index}`,
    options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3' },
    ],
    placeholder: `Filter by ss${index}`,
    ...options,
  };
  return singleSelectFilter;
}

function createMultiSelectFilter(
  index: number,
  options?: { isPinned?: boolean; isRequired?: boolean }
) {
  const multiSelectFilter: IToolbarMultiSelectFilter = {
    type: ToolbarFilterType.MultiSelect,
    key: `ms${index}`,
    query: `ms${index}`,
    label: `Multi-Select ${index}`,
    options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3' },
    ],
    placeholder: `Filter by ms${index}`,
    ...options,
  };
  return multiSelectFilter;
}

const dateRangeFilter: IToolbarDateRangeFilter = {
  type: ToolbarFilterType.DateRange,
  key: 'date',
  query: 'date',
  label: 'Date Range',
  options: [
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'last90days', label: 'Last 90 days' },
    { value: '', label: 'Custom', isCustom: true },
  ],
  placeholder: 'Filter by date range',
  isPinned: true,
  isRequired: true,
  defaultValue: 'last7days',
};

describe('PageToolbarFilters', () => {
  it('should render pinned items', () => {
    const singleTextFilter1 = createSingleTextFilter(1);
    const singleTextFilter2 = createSingleTextFilter(2, { isPinned: true });
    const multiTextFilter1 = createMultiTextFilter(1);
    const multiTextFilter2 = createMultiTextFilter(2, { isPinned: true });
    const singleSelectFilter1: IToolbarSingleSelectFilter = createSingleSelectFilter(1);
    const singleSelectFilter2: IToolbarSingleSelectFilter = createSingleSelectFilter(2, {
      isPinned: true,
    });
    const multiSelectFilter1: IToolbarMultiSelectFilter = createMultiSelectFilter(1);
    const multiSelectFilter2: IToolbarMultiSelectFilter = createMultiSelectFilter(2, {
      isPinned: true,
    });
    const toolbarFilters: IToolbarFilter[] = [
      singleTextFilter1,
      singleTextFilter2,
      multiTextFilter1,
      multiTextFilter2,
      singleSelectFilter1,
      singleSelectFilter2,
      multiSelectFilter1,
      multiSelectFilter2,
      dateRangeFilter,
    ];

    cy.mount(<ToolbarFiltersTest toolbarFilters={toolbarFilters} />);
    cy.get('input[placeholder="Filter by st2"]').should('exist');
    cy.get('input[placeholder="Filter by mt2"]').should('exist');
    cy.contains('Filter by ss2');
    cy.contains('Filter by ms2');
    cy.contains('Last 7 days');
  });

  it('limitFiltersToOneOrOperation should make multi-text-filter a single-text-filter', () => {
    const multiTextFilter1 = createMultiTextFilter(1, { isPinned: true });
    const multiSelectFilter1: IToolbarMultiSelectFilter = createMultiSelectFilter(1, {
      isPinned: true,
    });
    const toolbarFilters: IToolbarFilter[] = [multiTextFilter1, multiSelectFilter1];
    cy.mount(<ToolbarFiltersTest toolbarFilters={toolbarFilters} limitFiltersToOneOrOperation />);

    // Make sure the multi-text-filter is in multi-select mode
    cy.get('button[aria-label="apply filter"]').should('exist');

    // Open the multi select filter
    cy.get('button[data-cy="filter-input"]').click();

    // Make sure the multi-text-filter is in multi-select mode
    cy.get('button[aria-label="apply filter"]').should('exist');

    // Select the first option
    cy.get('input[type="checkbox"]').nthNode(0).click();

    // Make sure the multi-text-filter is in multi-select mode
    cy.get('button[aria-label="apply filter"]').should('exist');

    // Select the second option
    cy.get('input[type="checkbox"]').nthNode(1).click();

    // Make sure the multi-text-filter is in single-select mode
    cy.get('button[aria-label="apply filter"]').should('not.exist');
  });

  it('limitFiltersToOneOrOperation should make multi-select-filter a single-select-filter', () => {
    const multiTextFilter1 = createMultiTextFilter(1, { isPinned: true });
    const multiSelectFilter1: IToolbarMultiSelectFilter = createMultiSelectFilter(1, {
      isPinned: true,
    });
    const toolbarFilters: IToolbarFilter[] = [multiTextFilter1, multiSelectFilter1];
    cy.mount(<ToolbarFiltersTest toolbarFilters={toolbarFilters} limitFiltersToOneOrOperation />);

    // Make sure the multi-select-filter is in multi-select mode
    cy.get('button[data-cy="filter-input"]').click();
    cy.get('input[type="checkbox"]').should('exist');
    cy.get('button[data-cy="filter-input"]').click();

    // Filter by first option
    cy.get('input[placeholder="Filter by mt1"]').type('abc');
    cy.get('button[aria-label="apply filter"]').click();

    // Make sure the multi-select-filter is in multi-select mode
    cy.get('button[data-cy="filter-input"]').click();
    cy.get('input[type="checkbox"]').should('exist');
    cy.get('button[data-cy="filter-input"]').click();

    // Filter by second option
    cy.get('input[placeholder="Filter by mt1"]').type('def');
    cy.get('button[aria-label="apply filter"]').click();

    // Make sure the multi-select-filter is in single-select mode
    cy.get('button[data-cy="filter-input"]').click();
    cy.get('input[type="checkbox"]').should('not.exist');
  });
});
