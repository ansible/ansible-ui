import {
  PageDashboardChartVariant,
  PageDashboardChartVariantE,
} from '@ansible/ansible-ui-framework';
import { PageDashboardCard } from '@ansible/ansible-ui-framework/PageDashboard/PageDashboardCard';
import { PageSingleSelect } from '@ansible/ansible-ui-framework/PageInputs/PageSingleSelect';
import { useGetPageUrl } from '@ansible/ansible-ui-framework/PageNavigation/useGetPageUrl';
import { Flex, FlexItem, ToggleGroup, ToggleGroupItem, Tooltip } from '@patternfly/react-core';
import { t } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AwxRoute } from '../../main/AwxRoutes';
import { DashboardJobPeriod, DashboardJobType, JobsChart } from '../charts/JobsChart';

export function AwxJobActivityCard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<DashboardJobPeriod | null>('month');
  const [jobType, setJobType] = useState<DashboardJobType | null>('all');
  const getPageUrl = useGetPageUrl();
  const [variant, setVariantState] = useState<PageDashboardChartVariant>(() => {
    const value = localStorage.getItem('jobActivityChartVariant');
    switch (value) {
      case PageDashboardChartVariantE.lineChart:
      case PageDashboardChartVariantE.stackedAreaChart:
      case PageDashboardChartVariantE.barChart:
      case PageDashboardChartVariantE.stackedBarChart:
        return value;
      default:
        return PageDashboardChartVariantE.lineChart;
    }
  });
  const setVariant = (variant: PageDashboardChartVariant) => {
    setVariantState(variant);
    localStorage.setItem('jobActivityChartVariant', variant);
  };

  return (
    <PageDashboardCard
      id="job-activity"
      title={t('Job Activity')}
      linkText={t('View all Jobs')}
      to={getPageUrl(AwxRoute.Jobs)}
      width="xxl"
      height="sm"
      headerControls={
        <Flex spaceItems={{ default: 'spaceItemsNone' }} style={{ gap: 8 }}>
          <FlexItem>
            <ToggleGroup>
              <ToggleGroupItem
                text={<LineChartIcon />}
                isSelected={variant === PageDashboardChartVariantE.lineChart}
                onChange={() => setVariant(PageDashboardChartVariantE.lineChart)}
              />
              <ToggleGroupItem
                text={<BarChartIcon />}
                isSelected={variant === PageDashboardChartVariantE.barChart}
                onChange={() => setVariant(PageDashboardChartVariantE.barChart)}
              />
              <ToggleGroupItem
                text={<StackedAreaChartIcon />}
                isSelected={variant === PageDashboardChartVariantE.stackedAreaChart}
                onChange={() => setVariant(PageDashboardChartVariantE.stackedAreaChart)}
              />
              <ToggleGroupItem
                text={<StackedBarChartIcon />}
                isSelected={variant === PageDashboardChartVariantE.stackedBarChart}
                onChange={() => setVariant(PageDashboardChartVariantE.stackedBarChart)}
              />
            </ToggleGroup>
          </FlexItem>
          <FlexItem>
            <PageSingleSelect<DashboardJobPeriod>
              placeholder={t('Select period')}
              value={period}
              onSelect={setPeriod}
              options={[
                { label: t('Past month'), value: 'month' },
                { label: t('Past two weeks'), value: 'two_weeks' },
                { label: t('Past week'), value: 'week' },
                // { label: t('Past 24 hours'), value: 'day' },
              ]}
              isRequired
            />
          </FlexItem>
          <FlexItem>
            <PageSingleSelect<DashboardJobType>
              placeholder={t('Select job types')}
              value={jobType}
              onSelect={setJobType}
              options={[
                { label: t('All job types'), value: 'all' },
                { label: t('Inventory sync'), value: 'inv_sync' },
                { label: t('Scm update'), value: 'scm_update' },
                { label: t('Playbook run'), value: 'playbook_run' },
              ]}
              isRequired
            />
          </FlexItem>
        </Flex>
      }
    >
      <JobsChart period={period!} jobType={jobType!} variant={variant} />
    </PageDashboardCard>
  );
}

function BarChartIcon() {
  return (
    <Tooltip content={t('Bar Chart')}>
      <svg width={24} height={24} style={{ marginBottom: -7, marginLeft: -6, marginRight: -6 }}>
        <rect x={3} y={14} width={3} height={10} fill="currentcolor" opacity={0.5} />
        <rect x={0} y={10} width={3} height={14} fill="currentcolor" />

        <rect x={12} y={12} width={3} height={12} fill="currentcolor" opacity={0.5} />
        <rect x={9} y={16} width={3} height={8} fill="currentcolor" />

        <rect x={21} y={12} width={3} height={12} fill="currentcolor" opacity={0.5} />
        <rect x={18} y={4} width={3} height={20} fill="currentcolor" />
      </svg>
    </Tooltip>
  );
}

function StackedBarChartIcon() {
  const { t } = useTranslation();
  return (
    <Tooltip content={t('Stacked Bar Chart')}>
      <svg width={24} height={24} style={{ marginBottom: -7, marginLeft: -6, marginRight: -6 }}>
        <rect x={0} y={20} width={3} height={4} fill="currentcolor" />
        <rect x={7} y={12} width={3} height={12} fill="currentcolor" />
        <rect x={14} y={16} width={3} height={8} fill="currentcolor" />
        <rect x={21} y={8} width={3} height={16} fill="currentcolor" />

        <rect x={0} y={14} width={3} height={6} fill="currentcolor" opacity={0.5} />
        <rect x={7} y={8} width={3} height={4} fill="currentcolor" opacity={0.5} />
        <rect x={14} y={12} width={3} height={4} fill="currentcolor" opacity={0.5} />
        <rect x={21} y={2} width={3} height={6} fill="currentcolor" opacity={0.5} />
      </svg>
    </Tooltip>
  );
}

function LineChartIcon() {
  const { t } = useTranslation();
  return (
    <Tooltip content={t('Line Chart')}>
      <svg width={24} height={24} style={{ marginBottom: -7, marginLeft: -6, marginRight: -6 }}>
        <path d="M0 20 L8 12 L16 16 L24 0" fill="none" stroke="currentcolor" strokeWidth="2" />
        <path
          d="M0 10 L8 20 L16 6 L24 16"
          fill="none"
          stroke="currentcolor"
          strokeWidth="2"
          opacity={0.6}
        />
      </svg>
    </Tooltip>
  );
}

function StackedAreaChartIcon() {
  const { t } = useTranslation();
  return (
    <Tooltip content={t('Stacked Area Chart')}>
      <svg width={24} height={24} style={{ marginBottom: -7, marginLeft: -6, marginRight: -6 }}>
        <path d="M0 24 L0 16 L8 20 L16 12 L24 20 L24 24" fill="currentcolor" />
        <path d="M0 24 L0 10 L8 16 L18 6 L24 12 L24 24" fill="currentcolor" opacity={0.6} />
      </svg>
    </Tooltip>
  );
}
