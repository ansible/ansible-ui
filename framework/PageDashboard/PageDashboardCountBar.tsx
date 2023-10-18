import { ChartDonut, ChartLabel, ChartLabelProps } from '@patternfly/react-charts';
import { CardBody, Title } from '@patternfly/react-core';
import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { PageChartLegend } from './PageChartLegend';
import { PageDashboardCard } from './PageDashboardCard';

export type PageDashboardCountBarProps = {
  counts: {
    title: string;
    total?: number;
    to: string;
    counts?: { label: string; count: number; color: string; link?: string }[];
  }[];
};

export function PageDashboardCountBar(props: PageDashboardCountBarProps) {
  return (
    <PageDashboardCard width="xxl" isCompact>
      <CardBody>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-evenly',
            paddingLeft: 8,
            paddingRight: 8,
            gap: 16,
          }}
        >
          {props.counts.map((item, index) => {
            const id = item.title.toLowerCase().replace(/ /g, '-');
            const total: number =
              item.total ??
              item.counts?.reduce<number>((acc: number, curr) => acc + (curr.count ?? 0), 0) ??
              0;
            return (
              <div
                data-cy={id}
                id={id}
                key={index}
                style={{ display: 'flex', gap: 12, alignItems: 'center' }}
              >
                <Link to={item.to} style={{ color: 'var(--pf-v5-global--text--Color)' }}>
                  <Title
                    headingLevel="h3"
                    size="xl"
                    style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
                  >
                    {item.title}
                  </Title>
                </Link>

                {/* if there is a total and the item has counts and counts is not undefined */}
                {/* then we want to show the donut chart instead of just a count whisch is in the else */}
                {/* Note: even if there is counts but total is 0 we want to just render the count  */}
                {total && 'counts' in item && item.counts ? (
                  <>
                    <div
                      id={`${id}-chart`}
                      style={{ maxHeight: 64, marginTop: -4, marginBottom: -4 }}
                    >
                      <ChartDonut
                        title={item.counts
                          .reduce<number>((acc, curr) => acc + curr.count, 0)
                          .toString()}
                        titleComponent={<PageChartLabel to={item.to} />}
                        padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
                        width={64}
                        height={64}
                        data={item.counts.map((count) => ({ x: ' ', y: count.count }))}
                        colorScale={item.counts.map((count) => count.color)}
                        cornerRadius={1}
                        allowTooltip={false}
                      />
                    </div>
                    <PageChartLegend id={`${id}-legend`} legend={item.counts} />
                  </>
                ) : (
                  // This renders the total if there are no counts or total is zero
                  <span id={`${id}-chart`} style={{ fontSize: 'xx-large', lineHeight: 1 }}>
                    {total}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </PageDashboardCard>
  );
}

function PageChartLabel(props: ChartLabelProps & { to?: string }) {
  if (props.to) {
    return (
      <Link to={props.to} style={{ textDecoration: 'none' }}>
        <ChartLabel
          {...props}
          style={
            {
              ...props.style,
              fill: 'var(--pf-v5-global--link--Color)',
              stroke: 'var(--pf-v5-global--link--Color)',
            } as CSSProperties
          }
        />
      </Link>
    );
  }
  return (
    <ChartLabel
      {...props}
      style={
        {
          ...props.style,
          fill: 'var(--pf-v5-global--text--Color)',
          stroke: 'var(--pf-v5-global--text--Color)',
        } as CSSProperties
      }
    />
  );
}
