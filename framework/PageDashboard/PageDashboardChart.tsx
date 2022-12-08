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
          padding={{ bottom: 30, left: 30, right: 15, top: 5 }}
          colorScale={groups.map((group) => group.color)}
          width={size.width}
          height={size.height}
        >
          <ChartAxis />
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
