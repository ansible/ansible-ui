import { ChartSchemaElement, ChartType } from 'react-json-chart-builder';
import { TagName } from './constants';

export type AttributesType = { key: string; value: string }[];
export type SchemaFnc = (props: {
  label?: string;
  y?: string;
  xTickFormat?: string;
  chartType?: ChartType;
}) => ChartSchemaElement[];

export interface Tag {
  key: TagName;
  name: string;
  description: string;
}
