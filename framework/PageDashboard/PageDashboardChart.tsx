import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLegend,
  ChartLine,
  ChartStack,
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
  xLabel?: string;
  yLabel?: string;
  minDomain?: number | { x?: number; y?: number };
  variant?: 'stacked' | 'lines';
}) {
  let { groups } = props;
  const { xLabel, yLabel, minDomain } = props;

  const legendData =
    groups.find((g) => g.label) !== undefined &&
    groups
      .filter((g) => g.label)
      .map((group) => ({
        name: group.label ?? '',
        symbol: { fill: group.color, type: 'square' },
      }));

  groups = groups.filter((group) => {
    if (group.values.length === 0) return false;
    return true;
  });

  let paddingBottom = 60;
  if (xLabel) {
    if (legendData) {
      paddingBottom += 40;
    } else {
      paddingBottom += 16;
    }
  } else if (legendData) paddingBottom += 12;

  return (
    <PageChartContainer className="page-chart">
      {(size) => (
        <Chart
          padding={{
            bottom: paddingBottom,
            left: 60 + (yLabel ? 19 : 0),
            right: 24,
            top: 16,
          }}
          colorScale={groups.map((group) => group.color)}
          height={size.height}
          width={size.width}
          minDomain={minDomain}
          legendPosition={'bottom'}
          legendComponent={
            legendData ? <ChartLegend data={legendData} orientation="horizontal" /> : undefined
          }
          containerComponent={
            <ChartVoronoiContainer
              labels={(point: { datum: { x: string | number; y: string | number } }) => {
                const datum = point.datum;
                return `${datum.x}: ${datum.y}`;
              }}
            />
          }
        >
          <ChartAxis fixLabelOverlap label={xLabel} style={{ axisLabel: { fontSize: 16 } }} />
          <ChartAxis
            dependentAxis
            showGrid
            label={yLabel}
            style={{ axisLabel: { fontSize: 16 } }}
          />
          {props.variant === 'lines' ? (
            groups.map((group, index) => (
              <ChartLine
                key={index}
                data={group.values.map((value) => ({ x: value.label, y: value.value + 1 }))}
                interpolation="monotoneX"
                style={{ data: { strokeWidth: 3, stroke: group.color } }}
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
