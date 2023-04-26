import { ChartLegendEntry } from 'react-json-chart-builder';

export enum ApiType {
  nonGrouped = 'nonGrouped',
  grouped = 'grouped',
}

export interface NonGroupedApi {
  type?: ApiType.nonGrouped;
  items: ChartLegendEntry[] | undefined;
  meta?: {
    legend: ChartLegendEntry[] | undefined;
    count: number;
  };
}

export interface GroupedApi {
  type?: ApiType.grouped;
  dates: {
    date: string;
    items: ChartLegendEntry[] | undefined;
  }[];
  meta: {
    legend: ChartLegendEntry[];
    count: number;
  };
}

export type ApiReturnType = NonGroupedApi | GroupedApi;
