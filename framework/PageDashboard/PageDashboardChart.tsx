import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartStack,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { PageChartContainer } from './PageChartContainer';

export function PageDashboardChart(props: {
  groups: {
    color: string;
    values: {
      label: string;
      value: number;
    }[];
  }[];
}) {
  let { groups } = props;

  groups = groups.filter((group) => {
    for (const value of group.values) {
      if (value.value !== 0) return true;
    }
    return false;
  });

  return (
    <PageChartContainer>
      {(size) => (
        <Chart
          padding={{ bottom: 27, left: 40, right: 20, top: 10 }}
          colorScale={groups.map((group) => group.color)}
          width={size.width}
          height={size.height}
          containerComponent={
            <ChartVoronoiContainer labels={({ datum }) => `${datum.x}: ${datum.y}`} />
          }
        >
          <ChartAxis
            fixLabelOverlap
            // tickFormat={(date: string) => `${new Date(date).toLocaleDateString()}`}
            //  tickFormat={(n) => `${Math.round(n)}`}
          />
          <ChartAxis dependentAxis showGrid />
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
