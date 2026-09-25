import {
  IFilterState,
  IToolbarFilter,
  IView,
  ToolbarFilterType,
  QueryParams,
} from '@ansible/ansible-ui-framework';
import { DateRangeFilterPresets } from '@ansible/ansible-ui-framework/PageToolbar/PageToolbarFilters/ToolbarDateRangeFilter';

export function buildQueryString(
  view: IView,
  toolbarFilters: IToolbarFilter[],
  queryParams: QueryParams
) {
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

export function paramsToSearchObj(queryParams: QueryParams) {
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value = '']) => {
    if (Array.isArray(value)) {
      value.forEach((subval) => {
        params.append(key, subval);
      });
    } else {
      params.append(key, value);
    }
  });

  return params;
}

export function filtersToSearchObj(toolbarFilters: IToolbarFilter[], filterState: IFilterState) {
  const params = new URLSearchParams();

  for (const key in filterState) {
    const toolbarFilter = toolbarFilters?.find((filter) => filter.key === key);
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
    // Support for Activity Stream needing two values
    if (param === 'or__object1__in' && value) {
      params.append('or__object2__in', Array.isArray(value) ? value[0] : value);
    }
  }

  return params;
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
  const firstValue = values[0];
  if (typeof firstValue !== 'string') {
    return [undefined, undefined];
  }

  const activityStreamParam = getActivityStreamParam(filter, values, firstValue);
  if (activityStreamParam) return activityStreamParam;

  if (filter.query === 'search') {
    return [filter.query, values];
  }

  const dateRangeParam = getDateRangeParam(filter, values);
  if (dateRangeParam) return dateRangeParam;

  if (values.length === 1) {
    return [filter.query, firstValue];
  }

  if ('useAndOperator' in filter && filter.useAndOperator) {
    // In a few cases such as the labels filter, we want to use an AND operator which needs a chain__ prefix
    return [`chain__${filter.query}`, values];
  }

  return [`or__${filter.query}`, values];
}

function getActivityStreamParam(
  filter: IToolbarFilter,
  values: string[],
  firstValue: string
): [string, string] | undefined {
  if (filter.query !== 'object1__in') return undefined;
  if (values.length !== 1 || !values.some((value) => value !== '')) return undefined;
  return ['or__object1__in', firstValue.replaceAll('+', ',')];
}

function getDateRangeParam(filter: IToolbarFilter, values: string[]): [string, string] | undefined {
  if (filter.type !== ToolbarFilterType.DateRange) return undefined;

  const name = `${filter.query}__gte`;
  const date = new Date(Date.now());
  date.setSeconds(0);
  date.setMilliseconds(0);
  const offsets: Partial<Record<DateRangeFilterPresets, number>> = {
    [DateRangeFilterPresets.LastHour]: 60 * 60 * 1000,
    [DateRangeFilterPresets.Last24Hours]: 24 * 60 * 60 * 1000,
    [DateRangeFilterPresets.LastWeek]: 7 * 24 * 60 * 60 * 1000,
    [DateRangeFilterPresets.LastMonth]: 30 * 24 * 60 * 60 * 1000,
  };
  const offset = offsets[values[0] as DateRangeFilterPresets];
  return offset === undefined ? undefined : [name, new Date(date.getTime() - offset).toISOString()];
}
