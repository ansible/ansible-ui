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
      hosts_added?: number;
      hosts_deleted?: number;
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
    <PageChartContainer className="page-chart">
      {(size) => (
        <Chart
          padding={{ bottom: 60, left: 60, right: 40, top: 16 }}
          colorScale={groups.map((group) => group.color)}
          width={size.width}
          height={size.height}
          containerComponent={
            <ChartVoronoiContainer
              labels={(point: {
                datum: {
                  x: string | number;
                  y: string | number;
                  hosts_added?: string | number;
                  hosts_deleted?: string | number;
                };
              }) => {
                const datum = point.datum;
                return yLabel == 'Unique hosts' && datum.hosts_added !== undefined
                  ? `${datum.x} \n Subscription(s) consumed: ${datum.y} \n Hosts added: ${datum.hosts_added} \n Hosts deleted: ${datum.hosts_deleted}`
                  : yLabel == 'Unique hosts' && datum.hosts_added == undefined
                  ? `${datum.x} \n Subscription capacity: ${datum.y}`
                  : `${datum.x}: ${datum.y}`;
              }}
            />
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
                data={group.values.map((value) =>
                  group.label == 'Subscriptions consumed'
                    ? {
                        x: value.label,
                        y: value.value,
                        hosts_added: value.hosts_added,
                        hosts_deleted: value.hosts_deleted,
                      }
                    : {
                        x: value.label,
                        y: value.value,
                      }
                )}
                interpolation="monotoneX"
              />
            ))}
          </ChartStack>
        </Chart>
      )}
    </PageChartContainer>
  );
}
