import { Chart, ChartArea, ChartAxis, ChartStack } from '@patternfly/react-charts';
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
          padding={{ bottom: 27, left: 40, right: 0, top: 5 }}
          colorScale={groups.map((group) => group.color)}
          width={size.width}
          height={size.height}
        >
          <ChartAxis
            fixLabelOverlap
            label="ssddd"
            tickFormat={(date: string) => `${new Date(date).toLocaleDateString()}`}
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
