import {
  IFilterState,
  IToolbarFilter,
  IView,
  paramsToSearchObj,
  QueryParams,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { isValidDate, yyyyMMddFormat } from '@patternfly/react-core';

function isIsoDateString(value: string): boolean {
  const date = new Date(`${value}T00:00:00`);
  return isValidDate(date) && yyyyMMddFormat(date) === value;
}

export function getQueryString(
  view: IView,
  toolbarFilters: IToolbarFilter[],
  queryParams: QueryParams
): string {
  const { page, perPage, sort, sortDirection, filterState } = view;

  const query = new URLSearchParams([
    ...paramsToSearchObj(queryParams),
    ...filtersToSearchObj(toolbarFilters, filterState),
  ]);
  if (sort && query.get('order_by') === null) {
    query.append('order_by', sortDirection === 'desc' ? `-${sort}` : sort);
  }
  query.append('page', page.toString());
  query.append('page_size', perPage.toString());

  return `?${query.toString()}`;
}

export function isRequiredFilterValid(filter: IToolbarFilter, filterState: IFilterState): boolean {
  if (!('isRequired' in filter) || !filter.isRequired) return true;

  const values = filterState[filter.key];
  if (!values || values.length === 0) return false;

  // Custom date range requires 2 values: ['custom', 'start_date']
  // (end_date will default to the current date)
  // or 3 values: ['custom', 'start_date', 'end_date']
  if (filter.type === ToolbarFilterType.DateRange && values[0] === 'custom') {
    if (values.length === 2) return isIsoDateString(values[1]);
    if (values.length === 3) return isIsoDateString(values[1]) && isIsoDateString(values[2]);
    return false;
  }

  return true;
}

export function hasValidRequiredFilters(
  toolbarFilters?: IToolbarFilter[],
  filterState?: IFilterState
): boolean {
  if (!toolbarFilters) return true;
  return toolbarFilters.every((filter) => isRequiredFilterValid(filter, filterState ?? {}));
}

export function filtersToSearchObj(toolbarFilters: IToolbarFilter[], filterState: IFilterState) {
  const params = new URLSearchParams();

  for (const key in filterState) {
    const toolbarFilter = toolbarFilters?.find((filter) => filter.key === key);

    if (toolbarFilter?.type === ToolbarFilterType.DateRange) {
      appendDateRangeParams(params, filterState, toolbarFilter);
    } else {
      appendRegularFilterParams(params, filterState, toolbarFilter);
    }
  }
  return params;
}

function appendDateRangeParams(
  params: URLSearchParams,
  filterState: IFilterState,
  toolbarFilter: IToolbarFilter
) {
  const values = getPeriodFilterParam(filterState, toolbarFilter);
  if (Array.isArray(values)) {
    values.forEach((val) => {
      const [param, value] = val;
      if (param && value) {
        params.append(param, value);
      }
    });
  }
}

function appendRegularFilterParams(
  params: URLSearchParams,
  filterState: IFilterState,
  toolbarFilter?: IToolbarFilter
) {
  const [param, value] = getFilterParam(filterState, toolbarFilter);
  if (param && value) {
    if (Array.isArray(value)) {
      value.forEach((val) => {
        params.append(param, val);
      });
    } else {
      params.append(param, value);
    }
  }
}

export function getPeriodFilterParam(filterState: IFilterState, filter: IToolbarFilter) {
  let values = filterState[filter.key];
  if (values) values = values.filter((value) => value !== null);
  if (!values?.length) {
    return undefined;
  }
  if (values[0] === 'custom') {
    if (values.length === 2) {
      return [
        [filter.query, values[0]],
        ['start_date', values[1]],
        ['end_date', new Date(Date.now()).toISOString().split('T')[0]], // Use current date as end_date if not provided
      ];
    }
    if (values.length === 3) {
      return [
        [filter.query, values[0]],
        ['start_date', values[1]],
        ['end_date', values[2]],
      ];
    }
    return undefined;
  } else {
    return [[filter.query, values[0]]];
  }
}

function getFilterParam(
  filterState: IFilterState,
  filter?: IToolbarFilter
): [string | undefined, string | string[] | undefined] {
  if (!filter) {
    return [undefined, undefined];
  }

  let values = filterState[filter.key];
  if (values) values = values.filter((value) => value !== null);
  if (!values?.length) {
    return [undefined, undefined];
  }

  if (values.length === 1) {
    return [filter.query, values[0]];
  }

  return [filter.query, values];
}
