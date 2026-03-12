import { DashboardTableItem, ITemplateOptions } from '../interfaces';
import { Dispatch, SetStateAction } from 'react';

type DashboardCommonCardProps = {
  id: string;
  title: string;
  help?: string;
};

export type DashboardValueCardProps = DashboardCommonCardProps & {
  value: string | number;
  valueSuffix?: string;
  linkText?: string;
  to?: string;
};

export type DashboardTableCardProps = DashboardCommonCardProps & {
  firstColumnHeader: string;
  items: DashboardTableItem[];
  emptyStateTitle: string;
  errorStateTitle: string;
  error?: Error;
};

export type DashboardChartValueProps = {
  label: string;
  value: number;
};

export type DashboardChartCardProps = DashboardCommonCardProps & {
  variant: 'barChart' | 'lineChart';
  summaryValue?: number;
  values?: DashboardChartValueProps[];
};

export type DashboardTableInputFieldProps = {
  id: string;
  currentValue: number | undefined;
  onBlur: (value: number) => void;
  type?: 'number' | 'integer';
  min?: number;
  max?: number;
  label?: string;
  labelHelp?: string;
  fullWidth?: boolean;
};

export type DashboardTableToolbarProps = {
  isLoading: boolean;
  itemCount: number;
  toolbarState: ITemplateOptions;
  setToolbarState: Dispatch<SetStateAction<ITemplateOptions>>;
  onExportCsv?: () => void;
};
