import { IToolbarFilter } from '@ansible/ansible-ui-framework';

export interface AutomationDashboardToolbarFiltersProps {
  filterableFields: string[];

  /** Additional filters in addition to the dynamic filters */
  additionalFilters?: IToolbarFilter[];
}

export interface AsyncKeyOptions {
  /** The label for the filter
   * @example 'Label'
   * **/
  label: string;

  /** The API endpoint for the options that will be loaded asynchronously
   * @example 'labels'
   */
  apiPath: string;

  /**
   * The key to be used as the label for the resource.
   * @default 'name'
   */
  labelKey?: string;

  /**
   * The key to be used as the value for the resource.
   * @default 'id'
   */
  valueKey?: string;
}
