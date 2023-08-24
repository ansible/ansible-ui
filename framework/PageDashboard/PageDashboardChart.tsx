import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartCursorContainerProps,
  ChartLegend,
  ChartLegendTooltip,
  ChartLine,
  ChartScatter,
  ChartStack,
  ChartVoronoiContainerProps,
  createContainer,
} from '@patternfly/react-charts';
import { useSettings } from '../Settings';
import { PageChartContainer } from './PageChartContainer';

const CursorVoronoiContainer = createContainer('voronoi', 'cursor') as React.FunctionComponent<
  ChartVoronoiContainerProps & ChartCursorContainerProps
>;

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
  /** variant of the chart */
  variant?: 'stackedAreaChart' | 'lineChart';
}) {
  const { allowZero, xLabel, yLabel, minDomain, onlyIntegerTicks } = props;
  let { groups } = props;
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
    .map((group, index) => {
      return {
        childName: `${index}`, // Sync tooltip legend with the series associated with given chart name
        name: group.label,
        symbol: { fill: group.color, type: 'square' },
      };
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

  const { activeTheme } = useSettings();

  return (
    <PageChartContainer className="page-chart">
      {(size) => (
        <Chart
          name="ggg"
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
            <CursorVoronoiContainer
              cursorDimension="x"
              labels={(point: { datum: { y: string | number } }) => point.datum.y.toString()}
              labelComponent={
                <ChartLegendTooltip
                  title={(datum: { x: number | string }) => datum.x}
                  legendData={legendData}
                  cornerRadius={8}
                />
              }
              mouseFollowTooltips
              voronoiDimension="x"
              voronoiPadding={50}
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
          {props.variant === 'lineChart' &&
            groups.map((group, index) => (
              <ChartLine
                key={index}
                name={index.toString()}
                style={{ data: { strokeWidth: 3, stroke: group.color } }}
                data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                interpolation="monotoneX"
              />
            ))}
          {props.variant === 'lineChart' &&
            groups.map((group, index) => (
              <ChartScatter
                key={'scatter-' + index}
                name={'scatter-' + index}
                data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                size={({ active }) => (active ? 6 : 3)}
                style={{
                  data: { strokeWidth: 2, stroke: activeTheme === 'dark' ? '#0004' : '#FFF4' },
                }}
              />
            ))}
          {(!props.variant || props.variant === 'stackedAreaChart') && (
            <ChartStack>
              {groups.map((group, index) => (
                <ChartArea
                  key={index}
                  name={index.toString()}
                  data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                  interpolation="monotoneX"
                  style={{ data: { strokeWidth: 3, stroke: group.color } }}
                />
              ))}
            </ChartStack>
          )}
          {(!props.variant || props.variant === 'stackedAreaChart') && (
            <ChartStack>
              {groups.map((group, index) => (
                <ChartScatter
                  key={'scatter-' + index}
                  name={'scatter-' + index}
                  data={group.values.map((value) => ({
                    x: value.label,
                    y: value.value,
                  }))}
                  size={({ active }) => (active ? 6 : 3)}
                  style={{
                    data: { strokeWidth: 2, stroke: activeTheme === 'dark' ? '#0006' : '#FFF6' },
                  }}
                />
              ))}
            </ChartStack>
          )}
        </Chart>
      )}
    </PageChartContainer>
  );
}
