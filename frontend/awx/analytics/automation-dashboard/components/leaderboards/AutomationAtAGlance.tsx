import { useTranslation } from 'react-i18next';
import { PageDashboardCard, PageDashboardCardWidth } from '@ansible/ansible-ui-framework';
import { Divider, Flex, FlexItem, Truncate } from '@patternfly/react-core';
import { ClusterIcon, CubesIcon, SyncAltIcon } from '@patternfly/react-icons';
import { AtAGlanceKpiMetric } from './AtAGlanceKpiMetric';
import { DashboardSectionHeading } from './DashboardSectionHeading';
import { StreakDayStrip } from './StreakDayStrip';
import { DEFAULT_NUMBER_LOCALE } from '../../constants/common';
import { useAutomationLeaderboardsView } from '../../views/useAutomationLeaderboardsView';
import '../../AutomationDashboard.css';

export function AutomationAtAGlance(props: Readonly<{ width?: PageDashboardCardWidth }>) {
  const { t } = useTranslation();
  const title = t('Automation at a Glance');
  const { atAGlance, streakCalendar } = useAutomationLeaderboardsView();

  return (
    <PageDashboardCard
      id={'automation-at-glance'}
      title={title}
      helpTitle={title}
      help={t('Enterprise-wide automation summary for the last 30 days.')}
      width={props.width ?? 'xxl'}
    >
      <Flex
        style={{ marginTop: '0.5rem' }}
        alignItems={{ default: 'alignItemsStretch', xl: 'alignItemsFlexStart' }}
        direction={{ default: 'column', xl: 'row' }}
        gap={{ default: 'gapLg' }}
      >
        <FlexItem className="automation-at-a-glance-kpi-divider" style={{ flex: 1 }}>
          <AtAGlanceKpiMetric
            title={t('Jobs run')}
            help={t('Total successful job runs across the platform in the last 30 days.')}
            icon={<SyncAltIcon />}
            iconStatus="info"
            value={atAGlance.jobsRun.toLocaleString(DEFAULT_NUMBER_LOCALE)}
          ></AtAGlanceKpiMetric>
        </FlexItem>
        <FlexItem className="automation-at-a-glance-kpi-divider" style={{ flex: 1 }}>
          <AtAGlanceKpiMetric
            title={t('Active organizations')}
            help={t('Organizations with at least one successful job run in the last 30 days.')}
            icon={<ClusterIcon />}
            iconStatus="info"
            value={atAGlance.activeOrganizations.toLocaleString(DEFAULT_NUMBER_LOCALE)}
          ></AtAGlanceKpiMetric>
        </FlexItem>
        <FlexItem
          style={{
            flex: 1,
          }}
        >
          <AtAGlanceKpiMetric
            title={t('Featured template')}
            help={t(
              'Most-used job template by run count in the last 30 days. Ties are broken alphabetically.'
            )}
            icon={<CubesIcon />}
            iconStatus="info"
            caption={
              <Truncate
                content={atAGlance.featuredTemplate.name}
                maxCharsDisplayed={40}
                style={{ fontSize: 'var(--pf-t--global--font--size--sm)', textAlign: 'center' }}
              />
            }
            value={`${atAGlance.featuredTemplate.runs.toLocaleString(DEFAULT_NUMBER_LOCALE)} ${t('runs')}`}
          ></AtAGlanceKpiMetric>
        </FlexItem>
      </Flex>
      <Divider style={{ margin: '1rem 0' }} />
      <DashboardSectionHeading
        title={t('Automation streak')}
        help={t(
          'Consecutive calendar days (UTC) with at least one successful job run. Enterprise streak counts platform-wide activity; your org streak counts activity in your organization only.'
        )}
      />
      <div style={{ marginTop: '0.5rem' }}>
        <StreakDayStrip
          title={t('Enterprise')}
          streakDays={atAGlance.enterpriseStreakDays}
          showLegend
          days={streakCalendar}
          isSuccess={(day) => day.state !== 'none'}
          getRuns={(day) => day.enterpriseRuns}
        />
        <Divider style={{ margin: '1rem 0' }} />
        <StreakDayStrip
          title={t('Your org')}
          streakDays={atAGlance.orgStreakDays}
          days={streakCalendar}
          isSuccess={(day) => day.state === 'enterpriseAndOrg'}
          getRuns={(day) => day.orgRuns}
        />
      </div>
    </PageDashboardCard>
  );
}
