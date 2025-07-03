import {
  ChartCursorContainerProps,
  ChartVoronoiContainerProps,
  Chart,
  ChartArea,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartLegendTooltip,
  ChartLine,
  ChartScatter,
  ChartStack,
  createContainer,
} from '@patternfly/react-charts/victory';
import { useMemo } from 'react';
import { PageChartContainer } from './PageChartContainer';
import { PageChartLegend } from './PageChartLegend';
import './PageDashboardChart.css';

const CursorVoronoiContainer = createContainer('voronoi', 'cursor') as React.FunctionComponent<
  ChartVoronoiContainerProps & ChartCursorContainerProps
>;

export enum PageDashboardChartVariantE {
  lineChart = 'lineChart',
  stackedAreaChart = 'stackedAreaChart',
  barChart = 'barChart',
  stackedBarChart = 'stackedBarChart',
}

export type PageDashboardChartVariant = keyof typeof PageDashboardChartVariantE;

export function PageDashboardChart(props: {
  id?: string;
  groups: {
    label?: string;
    color: string;
    values: {
      label: string;
      value: number;
    }[];
    link?: string;
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
  variant?: PageDashboardChartVariant;
  /** additional padding if needed for chart */
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right: number;
  };
  /** show item count in legend */
  showLegendCount?: boolean;

  height?: number;
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

  const legend = groups
    .filter((group) => !!group.label)
    .map((group) => ({
      label: group.label!,
      count: group.values.reduce((acc, value) => acc + value.value, 0),
      color: group.color,
      link: group.link,
    }));

  const maxDomainY = useMemo(() => {
    const maxValues: Record<string, number> = {};
    for (const group of groups) {
      for (const entry of group.values) {
        switch (props.variant) {
          case PageDashboardChartVariantE.barChart:
          case PageDashboardChartVariantE.lineChart:
            maxValues[entry.label] = Math.max(maxValues[entry.label] ?? 0, entry.value);
            break;
          default:
            maxValues[entry.label] = (maxValues[entry.label] ?? 0) + entry.value;
            break;
        }
      }
    }
    return Object.values(maxValues).reduce((max, value) => (value > max ? value : max), 0);
  }, [groups, props.variant]);

  const padding = {
    top: (props.padding?.top ?? 4) + 16,
    bottom: (props.padding?.bottom ?? 32) + 16,
    left: (props.padding?.left ?? 12) + Math.round(maxDomainY).toString().length * 9.5 + 16,
    right: (props.padding?.right ?? 0) + 16,
  };

  return (
    <div
      style={{
        height: props.height,
        display: 'flex',
        flexGrow: 1,
        minHeight: '100%',
      }}
    >
      {yLabel && (
        <YAxisLabel label={yLabel} paddingTop={padding.top} paddingBottom={padding.bottom} />
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          gap: 16,
        }}
      >
        <div style={{ height: '100%', margin: -16 }}>
          <PageChartContainer className="page-chart">
            {(size) => (
              <Chart
                padding={padding}
                colorScale={groups.map((group) => group.color)}
                height={size.height}
                width={size.width}
                minDomain={minDomain}
                maxDomain={{ y: maxDomainY }}
                containerComponent={
                  <CursorVoronoiContainer
                    cursorDimension="x"
                    labels={(point: { datum: { y: string | number } }) => point.datum.y.toString()}
                    labelComponent={
                      <ChartLegendTooltip
                        // title={(datum: { x: number | string }) => datum.x}
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
                <ChartAxis fixLabelOverlap />
                <ChartAxis
                  dependentAxis
                  showGrid
                  tickFormat={
                    onlyIntegerTicks === false
                      ? undefined
                      : (t: number) => (Number.isInteger(t) ? t : '')
                  }
                />
                {props.variant === PageDashboardChartVariantE.lineChart &&
                  groups.map((group, index) => (
                    <ChartLine
                      key={index}
                      name={index.toString()}
                      style={{ data: { strokeWidth: 3, stroke: group.color } }}
                      data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                      interpolation="monotoneX"
                    />
                  ))}
                {props.variant === PageDashboardChartVariantE.lineChart &&
                  groups.map((group, index) => (
                    <ChartScatter
                      key={'scatter-' + index}
                      name={'scatter-' + index}
                      data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                      size={({ active }) => (active ? 6 : 3)}
                      style={{ data: { fill: group.color } }}
                    />
                  ))}
                {props.variant === PageDashboardChartVariantE.stackedBarChart && (
                  <ChartStack>
                    {groups.map((group, index) => (
                      <ChartBar
                        key={index}
                        name={index.toString()}
                        style={{ data: { fill: group.color } }}
                        data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                      />
                    ))}
                  </ChartStack>
                )}
                {props.variant === PageDashboardChartVariantE.barChart && (
                  <ChartGroup offset={10}>
                    {groups.map((group, index) => (
                      <ChartBar
                        key={index}
                        name={index.toString()}
                        style={{ data: { fill: group.color } }}
                        data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                      />
                    ))}
                  </ChartGroup>
                )}
                {(!props.variant ||
                  props.variant === PageDashboardChartVariantE.stackedAreaChart) && (
                  <ChartStack>
                    {groups.map((group, index) => (
                      <ChartArea
                        key={index}
                        name={index.toString()}
                        data={group.values.map((value) => ({ x: value.label, y: value.value }))}
                        interpolation="monotoneX"
                        style={{ data: { strokeWidth: 2 } }}
                      />
                    ))}
                  </ChartStack>
                )}
                {(!props.variant ||
                  props.variant === PageDashboardChartVariantE.stackedAreaChart) && (
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
                      />
                    ))}
                  </ChartStack>
                )}
              </Chart>
            )}
          </PageChartContainer>
        </div>
        {xLabel && (
          <XAxisLabel label={xLabel} paddingLeft={padding.left} paddingRight={padding.right} />
        )}
        <PageChartLegend
          id={props.id ?? 'chart'}
          legend={legend}
          horizontal
          showLegendCount={props.showLegendCount}
          allowZero={props.allowZero}
        />
      </div>
    </div>
  );
}

function XAxisLabel(props: { label: string; paddingLeft?: number; paddingRight?: number }) {
  return (
    <span
      style={{
        maxHeight: '1em',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: props.paddingLeft,
        paddingRight: props.paddingRight,
      }}
    >
      {props.label}
    </span>
  );
}

function YAxisLabel(props: {
  label: string;
  paddingLeft?: number;
  paddingBottom?: number;
  paddingTop?: number;
}) {
  return (
    <div
      style={{
        maxWidth: '1em',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: props.paddingLeft,
        paddingBottom: props.paddingBottom,
        paddingTop: props.paddingTop,
        marginRight: 16,
      }}
    >
      <span style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>{props.label}</span>
    </div>
  );
}
