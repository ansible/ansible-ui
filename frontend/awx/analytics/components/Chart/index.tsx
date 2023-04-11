import React, { FC, useEffect, useState } from 'react';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import ChartBuilder, {
  ChartData,
  ChartFunctions,
  ChartSchemaElement,
  functions,
} from 'react-json-chart-builder';
import { convertApiToData } from './convertApi';
import { ApiReturnType } from './types';
import { ChartDataSerie } from 'react-json-chart-builder/dist/cjs';

interface Props {
  schema: ChartSchemaElement[];
  data: ApiReturnType;
  specificFunctions?: ChartFunctions;
  namespace?: string;
}

interface Props {
  x?: number;
  y?: number;
  [key: string]: any;
}
// eslint-disable-next-line react/prop-types
const CustomPoint: FC<Props> = ({ x, y, disableInlineStyles, ...props }) => {
  return x != undefined && y != undefined ? (
    // eslint-disable-next-line react/prop-types
    <ExclamationCircleIcon x={x - 8} y={y - 8} {...props} {...props.events}></ExclamationCircleIcon>
  ) : null;
};

const customFunctions = (specificFunctions?: ChartFunctions) => ({
  ...functions,
  axisFormat: {
    ...functions.axisFormat,
    formatAsYear: (tick: string | number) =>
      Intl.DateTimeFormat('en', { year: 'numeric' }).format(new Date(tick)),
    formatAsMonth: (tick: string | number) =>
      Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(tick)),
    ...specificFunctions?.axisFormat,
  },
  labelFormat: {
    ...functions.labelFormat,
    ...specificFunctions?.labelFormat,
  },
  onClick: {
    ...functions.onClick,
    ...specificFunctions?.onClick,
  },
  dataComponent: {
    scatterPlot: CustomPoint,
  },
});

const applyHiddenFilter = (chartData: ChartData, chartSeriesHidden: string[] = []): ChartData => ({
  ...chartData,
  series: chartData.series.map((series: ChartDataSerie) => ({
    ...series,
    hidden:
      (!!series.serie[0].id || !!series.serie[0].host_id) &&
      !!chartSeriesHidden.includes(
        // eslint-disable-next-line no-prototype-builtins
        series.serie[0].hasOwnProperty('host_id').toString() ||
          // eslint-disable-next-line no-prototype-builtins
          series.serie[0].hasOwnProperty('id').toString()
      ),
  })),
});

const Chart: FC<Props> = ({ schema, data, specificFunctions }) => {
  const chartSeriesHiddenProps: string[] = [];

  const [chartData, setChartData] = useState<ChartData>({
    series: [],
    legend: [],
  });

  const setChartDataHook = (newChartData: ChartData) => {
    //TODO set hidden
    setChartData(newChartData);
  };

  useEffect(() => {
    setChartData(applyHiddenFilter(convertApiToData(data), chartSeriesHiddenProps));
  }, [data]);
  return (
    <ChartBuilder
      schema={schema}
      functions={{
        ...customFunctions(specificFunctions),
      }}
      dataState={[chartData, setChartDataHook]}
    />
  );
};

export default Chart;
