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
    color: string;
    values: {
      label: string;
      value: number;
    }[];
  }[];
  settings?: {
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
    // data to be shown in the legend
    legendData?: {
      name: string;
      symbol?: {
        fill?: string;
        type?: string;
      };
    }[];
  };
}) {
  let { groups } = props;
  const { settings } = props;

  groups = settings?.allowZero
    ? groups
    : groups.filter((group) => {
        for (const value of group.values) {
          if (value.value !== 0) return true;
        }
        return false;
      });

  return (
    <PageChartContainer className="page-chart">
      {(size) => (
        <Chart
          padding={{ bottom: 60, left: 60, right: 40, top: 16 }}
          colorScale={groups.map((group) => group.color)}
          height={settings && settings.legendData ? size.height * 0.9 : size.height}
          width={size.width}
          minDomain={settings && settings.minDomain}
          legendPosition={'bottom'}
          legendComponent={
            settings &&
            settings.legendData && (
              <ChartLegend
                width={size.height * 0.1}
                data={settings.legendData}
                orientation={'horizontal'}
              />
            )
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
          <ChartAxis
            fixLabelOverlap
            // tickFormat={(date: string) => `${new Date(date).toLocaleDateString()}`}
            //  tickFormat={(n) => `${Math.round(n)}`}
            label={settings && settings.xLabel}
            style={{ axisLabel: { fontSize: 16 } }}
          />
          <ChartAxis
            dependentAxis
            showGrid
            label={settings && settings.yLabel}
            style={{ axisLabel: { fontSize: 16 } }}
          />
          <ChartStack>
            {groups.map((group, index) =>
              settings && settings.useLines ? (
                <ChartLine
                  style={{ data: { strokeWidth: 3 } }}
                  key={index}
                  data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                  interpolation="monotoneX"
                />
              ) : (
                <ChartArea
                  key={index}
                  data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                  interpolation="monotoneX"
                />
              )
            )}
          </ChartStack>
        </Chart>
      )}
    </PageChartContainer>
  );
}
