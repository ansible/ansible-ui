import { Content, Divider, Flex, FlexItem, Icon } from '@patternfly/react-core';
import type { ReactNode } from 'react';
import { PageDashboardCard, PageDashboardCardWidth } from '@ansible/ansible-ui-framework';
import { DashboardSectionHeading } from './DashboardSectionHeading';
import { MetricLabel, MetricValue } from './DashboardMetricsText';

export function AtAGlanceKpiMetric(
  props: Readonly<{
    title: string;
    /** Omit when `description` already shows the definition as visible text. */
    help?: string;
    /** Visible one-line definition shown under the label, as an alternative to a hover-only help popover. */
    description?: string;
    value?: string;
    /** Custom element to render instead of the default MetricValue. Use for linked text or smaller values. */
    valueElement?: ReactNode;
    dimensionIcon: ReactNode;
    dimensionLabel: string;
    /** Optional small caption rendered under the value, still centered with the rest of the tile. */
    caption?: ReactNode;
    width?: PageDashboardCardWidth;
  }>
) {
  const {
    title,
    help,
    description,
    value,
    valueElement,
    dimensionIcon,
    dimensionLabel,
    caption,
    width,
  } = props;

  return (
    <PageDashboardCard width={width ?? 'md'}>
      <Flex
        className="automation-dashboard-highlights-split-kpi"
        alignItems={{ default: 'alignItemsStretch' }}
        style={{ flexFlow: width === 'xs' ? 'column' : 'row' }}
      >
        <FlexItem className="automation-dashboard-highlights-split-kpi__dimension">
          <Flex
            justifyContent={{ default: 'justifyContentCenter' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <Flex
              direction={{ default: 'column' }}
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapSm' }}
            >
              <Icon size="xl" status="custom" className="automation-dashboard-accent-icon">
                {dimensionIcon}
              </Icon>
              <Content
                component="p"
                // --pf-t--global--* tokens (defined on :root), not --pf-v6-c-title--*, which
                // only exists under a .pf-v6-c-title ancestor this <p> doesn't have.
                style={{
                  fontSize: 'var(--pf-t--global--font--size--md)',
                  lineHeight: 'var(--pf-t--global--font--line-height--heading)',
                  fontWeight: 700,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                {dimensionLabel}
              </Content>
            </Flex>
          </Flex>
        </FlexItem>
        <Divider
          orientation={{ default: width === 'xs' ? 'horizontal' : 'vertical' }}
          inset={{ default: 'insetMd' }}
        />
        <FlexItem className="automation-dashboard-highlights-split-kpi__metric">
          <Flex
            direction={{ default: 'column' }}
            alignItems={{ default: 'alignItemsFlexStart' }}
            gap={{ default: 'gapSm' }}
            className="automation-dashboard-highlights-split-kpi__metric-content"
          >
            <div>
              <DashboardSectionHeading title={title} help={help} size="md" />
              {description ? <MetricLabel>{description}</MetricLabel> : null}
            </div>
            {valueElement ?? (value ? <MetricValue>{value}</MetricValue> : null)}
            {caption}
          </Flex>
        </FlexItem>
      </Flex>
    </PageDashboardCard>
  );
}
