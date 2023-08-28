import { ChartDonut, ChartLabel, ChartLabelProps } from '@patternfly/react-charts';
import { CardBody, Title } from '@patternfly/react-core';
import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
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
          {props.counts.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Link to={item.to} style={{ color: 'var(--pf-global--text--Color)' }}>
                <Title
                  headingLevel="h3"
                  size="xl"
                  style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
                >
                  {item.title}
                </Title>
              </Link>
              {'counts' in item && item.counts ? (
                <>
                  <div style={{ maxHeight: 64, marginTop: -4, marginBottom: -4 }}>
                    <ChartDonut
                      title={item.counts
                        .reduce<number>((acc, curr) => acc + curr.count, 0)
                        .toString()}
                      titleComponent={<PageChartLabel to={item.to} />}
                      padding={{ top: 0, left: 0, right: 0, bottom: 0 }}
                      width={64}
                      height={64}
                      data={item.counts.map((count) => ({ x: count.label, y: count.count }))}
                      colorScale={item.counts.map((count) => count.color)}
                      cornerRadius={3}
                      allowTooltip={false}
                    />
                  </div>
                  <PageChartLegend legend={item.counts} />
                </>
              ) : (
                <span style={{ fontSize: 'xx-large', lineHeight: 1 }}>{item.total}</span>
              )}
              {/* <Link to={item.to}>
                <ArrowRightIcon />
              </Link> */}
            </div>
          ))}
        </div>
      </CardBody>
    </PageDashboardCard>
  );
}

export function PageChartLegend(props: {
  legend: { label: string; count: number; color: string; link?: string }[];
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        columnGap: 6,
        alignItems: 'center',
      }}
    >
      {props.legend.map((item, index) => {
        if (item.count === 0) return <></>;
        return (
          <>
            <div
              key={index * 3 + 0}
              style={{ width: 10, height: 10, backgroundColor: item.color, borderRadius: 2 }}
            />
            <div key={index * 3 + 1} style={{ fontSize: 'small', textAlign: 'center' }}>
              {item.count}
            </div>
            <div key={index * 3 + 2} style={{ fontSize: 'small' }}>
              {item.link ? (
                <Link to={item.link} style={{ textDecoration: 'none' }}>
                  {item.label}
                </Link>
              ) : (
                item.label
              )}
            </div>
          </>
        );
      })}
    </div>
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
              fill: 'var(--pf-global--link--Color)',
              stroke: 'var(--pf-global--link--Color)',
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
          fill: 'var(--pf-global--text--Color)',
          stroke: 'var(--pf-global--text--Color)',
        } as CSSProperties
      }
    />
  );
}
