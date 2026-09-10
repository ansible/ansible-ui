import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { PageDashboardCardWidth, PageDashboardContext } from '@ansible/ansible-ui-framework';
import { Icon, Title, Truncate } from '@patternfly/react-core';
import { ClusterIcon, CubesIcon, StarIcon, SyncAltIcon } from '@patternfly/react-icons';
import { AtAGlanceKpiMetric } from './AtAGlanceKpiMetric';
import { DEFAULT_NUMBER_LOCALE } from '../../constants/common';
import { useAutomationLeaderboardsView } from '../../views/useAutomationLeaderboardsView';
import '../../AutomationDashboard.css';
import { DashboardGridRow } from '../DashboardLayout';

/**
 * Width of the 3 side-by-side KPI cards, keyed off the measured dashboard grid column count.
 *
 * This is deliberately its own breakpoint scale, separate from `getLeaderboardCardWidths` in
 * `../../AutomationLeaderboards.tsx`: that one sizes a single full-width card (Streak, Activity
 * levels), this one sizes 3 cards sharing a row, so the two need not — and currently do not —
 * change tier at the same column count. Don't "align" the numbers without checking both still
 * look right at every breakpoint.
 */
export function getAtAGlanceKpiCardWidth(gridColumns: number): PageDashboardCardWidth {
  if (gridColumns <= 17) return 'lg';
  if (gridColumns <= 23) return 'sm';
  return 'md';
}

export function AutomationAtAGlance() {
  const { t } = useTranslation();
  const title = t('At a glance');
  const { atAGlance } = useAutomationLeaderboardsView();
  const { columns: gridColumns } = useContext(PageDashboardContext);
  const kpiCardWidth = getAtAGlanceKpiCardWidth(gridColumns);

  return (
    <>
      <DashboardGridRow>
        <Title
          data-testid="at-a-glance-card-title"
          headingLevel="h3"
          size="xl"
          style={{ display: 'block', verticalAlign: '-0.15em', lineHeight: '1.2' }}
        >
          {title}
        </Title>
      </DashboardGridRow>
      <DashboardGridRow>
        <AtAGlanceKpiMetric
          width={kpiCardWidth}
          title={t('Jobs run')}
          help={t('Total successful job runs across the platform.')}
          dimensionIcon={<SyncAltIcon />}
          dimensionLabel={t('Velocity')}
          value={atAGlance.jobsRun.toLocaleString(DEFAULT_NUMBER_LOCALE)}
        ></AtAGlanceKpiMetric>

        <AtAGlanceKpiMetric
          width={kpiCardWidth}
          title={t('Active orgs')}
          help={t('Organizations with at least one successful job run.')}
          dimensionIcon={<ClusterIcon />}
          dimensionLabel={t('Reach')}
          value={atAGlance.activeOrganizations.toLocaleString(DEFAULT_NUMBER_LOCALE)}
        ></AtAGlanceKpiMetric>

        <AtAGlanceKpiMetric
          width={kpiCardWidth}
          title={t('Featured template')}
          help={t('Most-used job template by run count. Ties are broken alphabetically.')}
          dimensionIcon={<CubesIcon />}
          dimensionLabel={t('Usage')}
          caption={
            <span
              style={{
                fontSize: 'var(--pf-t--global--font--size--sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Icon
                size="sm"
                status="custom"
                className="automation-dashboard-featured-template-star"
              >
                <StarIcon />
              </Icon>
              <Truncate
                content={atAGlance.featuredTemplate.name}
                maxCharsDisplayed={40}
                style={{ fontSize: 'var(--pf-t--global--font--size--sm)', textAlign: 'center' }}
              />
            </span>
          }
          value={`${atAGlance.featuredTemplate.runs.toLocaleString(DEFAULT_NUMBER_LOCALE)} ${t('runs')}`}
        ></AtAGlanceKpiMetric>
      </DashboardGridRow>
    </>
  );
}
