import { Dispatch, SetStateAction } from 'react';
import { IFilterState, IToolbarFilter } from '@ansible/ansible-ui-framework';
import { IAwxView } from '../../../common/useAwxView';

// ─── Dashboard Data Models (API shapes) ──────────────────────────────────────

export interface IDashboardTableItem {
  id: number;
  name: string;
  execution_count: number;
}

export interface IDashboardChartItem {
  label: string;
  value: number;
}

export interface IDashboardChart {
  kind: 'hour' | 'day' | 'month' | 'year';
  items: IDashboardChartItem[];
}

export interface IJobTemplate {
  id: number;
  template_name: string;
  runs: number;
  num_hosts: number;
  time_taken_manually_execute_minutes: number;
  time_taken_create_automation_minutes: number;
  elapsed: string;
  automated_costs: number;
  manual_costs: number;
  savings: number;
}

export interface ISubscriptionCosts {
  id: number;
  monthly_subscription_cost: number;
  engineer_avg_hourly_rate: number;
  include_template_creation_time_in_costs: boolean;
}

export interface IDashboardDetails {
  total_number_of_successful_jobs: number | null;
  total_number_of_failed_jobs: number | null;
  total_number_of_unique_hosts: number | null;
  cost_of_automated_execution: number | null;
  cost_of_manual_automation: number | null;
  total_hours_of_automation: number | null;
  total_saving: number | null;
  total_time_saving: number | null;
  total_number_of_host_job_runs: number | null;
  total_number_of_job_runs: number | null;
  top_projects: IDashboardTableItem[];
  top_users: IDashboardTableItem[];
  job_chart: IDashboardChart;
  host_chart: IDashboardChart;
}

export interface IDashboardFilterSet {
  id: number;
  name: string;
  filters: string;
  is_default: boolean;
}

export interface IAutomationDashboardCollectionStatus {
  enabled: boolean | null;
  next_run: Date | null;
  initial_collection_status: string | null;
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

export interface AutomationDashboardToolbarFiltersProps {
  filterableFields: string[];
  /** Additional filters appended after the dynamic filters. */
  additionalFilters?: IToolbarFilter[];
}

export interface AsyncKeyOptions {
  /** Display label for the filter (also used as an i18n key). */
  label: string;
  /** API endpoint path used to load select options asynchronously. */
  apiPath: string;
  /** Key used as the option label. Defaults to `'name'`. */
  labelKey?: string;
  /** Key used as the option value. Defaults to `'id'`. */
  valueKey?: string;
}

// ─── Component Prop Types ─────────────────────────────────────────────────────

type DashboardCommonCardProps = {
  id: string;
  title: string;
  help?: string;
  error?: Error;
  errorStateTitle: string;
};

export type DashboardValueCardProps = DashboardCommonCardProps & {
  value: string | number;
  valueSuffix?: string;
  formatAsCurrency?: boolean;
  linkText?: string;
  to?: string;
};

export type DashboardTableCardProps = DashboardCommonCardProps & {
  firstColumnHeader: string;
  items?: IDashboardTableItem[];
  loading: boolean;
  clearAllFilters: () => void;
  filterState: IFilterState;
};

export type DashboardChartCardProps = DashboardCommonCardProps & {
  variant: 'barChart' | 'lineChart';
  summaryValue?: number;
  data: IDashboardChart;
};

export type DashboardTableInputFieldProps = {
  id: string;
  value: number | undefined;
  onChange: (value: number) => void;
  type?: 'number' | 'integer';
  min?: number;
  max?: number;
  label?: string;
  labelHelp?: string;
  fullWidth?: boolean;
  readOnly?: boolean;
  error?: string;
};

export type DashboardTableToolbarProps = {
  isLoading: boolean;
  itemCount: number | undefined;
  costState: ISubscriptionCosts | undefined;
  setCostState: Dispatch<SetStateAction<ISubscriptionCosts | undefined>> | undefined;
  refresh: () => Promise<void>;
  onExportCsv?: () => void;
};

// ─── View Type ────────────────────────────────────────────────────────────────

export type IAutomationDashboardView = {
  mainTableView: IAwxView<IJobTemplate>;
  details: IDashboardDetails | undefined;
  detailsError: Error | undefined;
  detailsLoading: boolean;
  costState: ISubscriptionCosts | undefined;
  setCostState: Dispatch<SetStateAction<ISubscriptionCosts | undefined>>;
  loading: boolean;
  refresh: () => Promise<void>;
  exportCsv: () => Promise<void>;
  exportPdf: () => Promise<void>;
};
