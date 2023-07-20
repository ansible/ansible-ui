import {
  Chart,
  ChartArea,
  ChartAxis,
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
    minDomain?: number | { x?: number; y?: number };
    yLabel?: string; // TODO allow more options
    xLabel?: string; // TODO allow more options
    allowZero?: boolean;
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
          width={size.width}
          height={size.height}
          minDomain={settings && settings.minDomain}
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
          />
          <ChartAxis dependentAxis showGrid label={settings && settings.yLabel} />
          <ChartStack>
            {groups.map((group, index) => (
              <ChartArea
                key={index}
                data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                interpolation="monotoneX"
              />
            ))}
          </ChartStack>
        </Chart>
      )}
    </PageChartContainer>
  );
}
