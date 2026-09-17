import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { PageDashboardContext } from '@ansible/ansible-ui-framework';
import { Icon, Title, Truncate } from '@patternfly/react-core';
import { ClusterIcon, CubesIcon, StarIcon, SyncAltIcon } from '@patternfly/react-icons';
import { AtAGlanceKpiMetric } from './AtAGlanceKpiMetric';
import { DEFAULT_NUMBER_LOCALE } from '../../constants/common';
import { useAutomationLeaderboardsView } from '../../views/useAutomationLeaderboardsView';
import '../../AutomationDashboard.css';
import { DashboardGridRow } from '../DashboardLayout';
import { widthOrFullRow } from '../../common/leaderboardCardWidths';

/** Hardcoded for now — see AutomationLeaderboards.tsx for the same treatment of the other rows.
 *  Exported so `AutomationAtAGlance.test.tsx` can assert against the real value. */
export const KPI_CARD_WIDTH = 'md';

export function AutomationAtAGlance() {
  const { t } = useTranslation();
  const title = t('At a glance');
  const { atAGlance } = useAutomationLeaderboardsView();
  const { columns: gridColumns } = useContext(PageDashboardContext);
  const kpiCardWidth = widthOrFullRow(gridColumns, KPI_CARD_WIDTH);

  return (
    <>
      <DashboardGridRow>
        <div style={{ gridColumn: `span ${gridColumns}`, maxWidth: '100%' }}>
          <Title
            data-testid="at-a-glance-card-title"
            headingLevel="h3"
            size="xl"
            style={{ display: 'block', verticalAlign: '-0.15em', lineHeight: '1.2' }}
          >
            {title}
          </Title>
        </div>
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
          title={t('Active organizations')}
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
