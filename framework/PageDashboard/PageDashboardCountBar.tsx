import { ChartPie } from '@patternfly/react-charts/victory';
import { Title } from '@patternfly/react-core';
import { t } from 'i18next';
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
    <PageDashboardCard title={t('Resource Counts')} width="xxl">
      <div
        data-cy="resource-count-bar"
        data-testid="resource-count-bar"
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
              data-testid={id}
              id={id}
              key={index}
              style={{ display: 'flex', gap: 12, alignItems: 'center' }}
            >
              <Link to={item.to}>
                <Title headingLevel="h3" size="xl" style={{ whiteSpace: 'nowrap' }}>
                  {total} {item.title}
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
                    <ChartPie
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
    </PageDashboardCard>
  );
}
