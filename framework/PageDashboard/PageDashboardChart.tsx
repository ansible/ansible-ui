import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLegend,
  ChartLine,
  ChartStack,
  ChartTooltip,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { PageChartContainer } from './PageChartContainer';
import './PageDashboardChart.css';

export function PageDashboardChart(props: {
  groups: {
    label?: string;
    color: string;
    values: {
      label: string;
      value: number;
    }[];
  }[];
  // prevent y axis to show float values
  onlyIntegerTicks?: boolean;
  // minimal shown value
  minDomain?: number | { x?: number; y?: number };
  // label for x ax
  yLabel?: string;
  // label for y ax
  xLabel?: string;
  // prevents filtering of zero values
  allowZero?: boolean;
  // chart will have lines instead of area
  useLines?: boolean;
}) {
  let { groups } = props;
  const { allowZero, xLabel, yLabel, minDomain, onlyIntegerTicks, useLines } = props;

  groups = allowZero
    ? groups
    : groups.filter((group) => {
        for (const value of group.values) {
          if (value.value !== 0) return true;
        }
        return false;
      });
  const legendData = groups
    .filter((group) => !!group.label)
    .map((group) => {
      return { name: group.label, symbol: { fill: group.color, type: 'square' } };
    });
  let paddingBottom = 60;
  if (xLabel) {
    if (legendData.length > 0) {
      paddingBottom += 40;
    } else {
      paddingBottom += 16;
    }
  } else if (legendData) paddingBottom += 12;

  // edge case if all values are zero set maxDomain for y to 5 to make it look normal
  const onlyZeros = !groups.find((group) => group.values.find((value) => value.value !== 0));

  return (
    <PageChartContainer className="page-chart">
      {(size) => (
        <Chart
          padding={{
            bottom: paddingBottom,
            left: 60 + (yLabel ? 19 : 0),
            right: 40,
            top: 8,
          }}
          colorScale={groups.map((group) => group.color)}
          height={size.height}
          width={size.width}
          minDomain={minDomain}
          maxDomain={onlyZeros ? { y: 5 } : undefined}
          legendPosition="bottom"
          legendComponent={
            legendData.length > 0 ? (
              <ChartLegend data={legendData} orientation="horizontal" />
            ) : undefined
          }
          containerComponent={
            <ChartVoronoiContainer
              voronoiDimension="x"
              labels={(point: {
                datum: { x: string | number; y: string | number; _stack: number };
              }) => {
                const datum = point.datum;
                const group = groups[datum._stack - 1];
                return `${group?.label}: ${datum.y}`;
              }}
              labelComponent={<ChartTooltip dy={-7} constrainToVisibleArea />}
            />
          }
        >
          <ChartAxis fixLabelOverlap label={xLabel} style={{ axisLabel: { fontSize: 16 } }} />
          <ChartAxis
            dependentAxis
            showGrid
            label={yLabel}
            tickFormat={
              onlyIntegerTicks
                ? //eslint-disable-next-line @typescript-eslint/no-unsafe-return
                  (t) => (Number.isInteger(t) ? t : '')
                : undefined
            }
            style={{ axisLabel: { fontSize: 16 } }}
          />
          {useLines ? (
            groups.map((group, index) => (
              <ChartLine
                style={{ data: { strokeWidth: 3, stroke: group.color } }}
                key={index}
                data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                interpolation="monotoneX"
              />
            ))
          ) : (
            <ChartStack>
              {groups.map((group, index) => (
                <ChartArea
                  key={index}
                  data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                  interpolation="monotoneX"
                  style={{ data: { strokeWidth: 3, stroke: group.color } }}
                />
              ))}
            </ChartStack>
          )}
        </Chart>
      )}
    </PageChartContainer>
  );
}
