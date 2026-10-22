import {
  IFilterState,
  IToolbarFilter,
  IView,
  QueryParams,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { readSelection, selectionStateKeys } from './filterSelection';
import { getPeriodFilterParam } from './queryString';

/**
 * The JSON body of the report POST query endpoints (`report/query/`, `report/details/query/`,
 * `report/export/query/`): the period, the query params (e.g. the time zone) and the selection
 * of every filter, described with the selection parameters (`select_all_<field>`,
 * `search_<field>`, `excluded_<field>`, `excluded_search_<field>`) instead of every selected ID.
 * The body has no size limit like a URL, and "select all" is no filter on the field, so it also
 * counts the historical runs of deleted items.
 */
export type ReportQueryBody = Record<string, string | number[] | string[] | boolean>;

/** The IDs as numbers (`readSelection` keeps only numeric IDs). */
function toIds(values: string[]) {
  return values.map(Number);
}

/** Sets `key` in the body unless the list is empty: an empty list means no filter. */
function setList(body: ReportQueryBody, key: string, values: number[] | string[]) {
  if (values.length > 0) body[key] = values;
}

/** Adds the selection of the multi-select filter, under its API field (`filter.query`). */
function addSelection(body: ReportQueryBody, filter: IToolbarFilter, filterState: IFilterState) {
  const selection = readSelection(filterState, filter.key);
  // The API parameters of the field are named like the filter state keys of the filter.
  const params = selectionStateKeys(filter.query);
  if (selection.selectAll) body[params.selectAll] = true;
  setList(body, params.ids, toIds(selection.ids));
  setList(body, params.search, selection.search);
  setList(body, params.excluded, toIds(selection.excluded));
  setList(body, params.excludedSearch, selection.excludedSearch);
}

/** The body of the report query endpoints for the filters; see `ReportQueryBody`. */
export function getReportQueryBody(
  toolbarFilters: IToolbarFilter[],
  filterState: IFilterState,
  queryParams: QueryParams = {},
  extra: ReportQueryBody = {}
): ReportQueryBody {
  const body: ReportQueryBody = {};
  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined) body[key] = value;
  }
  for (const filter of toolbarFilters) {
    if (filter.type === ToolbarFilterType.DateRange) {
      for (const [param, value] of getPeriodFilterParam(filterState, filter) ?? []) {
        if (param && value) body[param] = value;
      }
    } else if (filter.type === ToolbarFilterType.AsyncMultiSelect) {
      addSelection(body, filter, filterState);
    }
  }
  return { ...body, ...extra };
}

/**
 * The query string of a report page request: the page, its size and the ordering stay in the
 * URL of the POST query endpoints, where the paginator and the ordering filter read them.
 */
export function getReportPageQueryString(
  view: Pick<IView, 'page' | 'perPage' | 'sort' | 'sortDirection'>
) {
  const query = new URLSearchParams();
  if (view.sort) {
    query.append('order_by', view.sortDirection === 'desc' ? `-${view.sort}` : view.sort);
  }
  query.append('page', view.page.toString());
  query.append('page_size', view.perPage.toString());
  return `?${query.toString()}`;
}

/** The SWR fetcher of a report query: the key is the url and the JSON body. */
export function postReportQuery<T>([url, body]: [string, string]) {
  return postRequest<T>(url, JSON.parse(body) as unknown);
}
