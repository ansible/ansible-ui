import { Flex, Icon } from '@patternfly/react-core';
import type { ReactNode } from 'react';
import { DashboardSectionHeading } from './DashboardSectionHeading';
import { MetricLabel, MetricValue } from './DashboardMetricsText';

type KpiIconStatus = 'info' | 'success' | 'warning' | 'danger' | 'custom';

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
    icon: ReactNode;
    iconStatus: KpiIconStatus;
    /** Optional small caption rendered under the value, still centered with the rest of the tile. */
    caption?: ReactNode;
  }>
) {
  const { title, help, description, value, valueElement, icon, iconStatus, caption } = props;

  return (
    <Flex
      direction={{ default: 'column' }}
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapSm' }}
    >
      <Icon size="xl" status={iconStatus}>
        {icon}
      </Icon>
      <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
        <DashboardSectionHeading title={title} help={help} size="md" />
      </div>
      {description ? <MetricLabel>{description}</MetricLabel> : null}
      {valueElement ?? (value ? <MetricValue>{value}</MetricValue> : null)}
      {caption}
    </Flex>
  );
}
