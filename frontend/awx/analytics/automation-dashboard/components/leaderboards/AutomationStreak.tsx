import { useTranslation } from 'react-i18next';
import { PageDashboardCard, PageDashboardCardWidth } from '@ansible/ansible-ui-framework';
import { Divider } from '@patternfly/react-core';
import { StreakDayStrip } from './StreakDayStrip';
import { useAutomationLeaderboardsView } from '../../views/useAutomationLeaderboardsView';
import '../../AutomationDashboard.css';

export function AutomationStreak(props: Readonly<{ width?: PageDashboardCardWidth }>) {
  const { t } = useTranslation();
  const title = t('Streak');
  const help = t(
    'Consecutive calendar days (UTC) with at least one successful job run. Enterprise streak counts platform-wide activity; your organization streak counts activity in your organization only.'
  );
  const { atAGlance, streakCalendar } = useAutomationLeaderboardsView();

  return (
    <PageDashboardCard
      id={'automation-streak'}
      title={title}
      helpTitle={title}
      help={help}
      width={props.width ?? 'xxl'}
    >
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
          title={t('Your organization')}
          streakDays={atAGlance.orgStreakDays}
          days={streakCalendar}
          isSuccess={(day) => day.state === 'enterpriseAndOrg'}
          getRuns={(day) => day.orgRuns}
        />
      </div>
    </PageDashboardCard>
  );
}
