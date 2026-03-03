import { DashboardTableItem } from '../interfaces';

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
