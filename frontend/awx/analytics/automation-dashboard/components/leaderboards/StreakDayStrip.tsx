import { Flex, FlexItem, Label, Tooltip } from '@patternfly/react-core';
import { DashboardSectionHeading } from './DashboardSectionHeading';
import { useTranslation } from 'react-i18next';
import { MetricLabel } from './DashboardMetricsText';
import { FireIcon } from '@patternfly/react-icons';
import { PageChartLegend } from '@ansible/ansible-ui-framework/PageDashboard/PageChartLegend';
import type { StreakDay } from '../../views/useAutomationLeaderboardsView';
import '../../AutomationDashboard.css';

/** Kept in sync with `.streak-heat-cell--success` / `--empty` in AutomationDashboard.css. */
const STREAK_SUCCESS_COLOR = 'var(--pf-t--global--color--status--success--default)';
const STREAK_EMPTY_COLOR = 'var(--pf-t--global--color--nonstatus--gray--100)';

type Translate = (key: string, options?: Record<string, unknown>) => string;

function jobRunsLabel(count: number, t: Translate): string {
  return count === 1
    ? t('{{count}} successful job run', { count })
    : t('{{count}} successful job runs', { count });
}

function streakDayTooltipContent(day: StreakDay, success: boolean, runs: number, t: Translate) {
  return (
    <>
      <strong>{day.dateStr}</strong>
      <br />
      {success ? jobRunsLabel(runs, t) : t('No successful job runs')}
    </>
  );
}

function streakDayTooltipAriaLabel(
  day: StreakDay,
  success: boolean,
  runs: number,
  t: Translate
): string {
  return `${day.dateStr}: ${success ? jobRunsLabel(runs, t) : t('No successful job runs')}`;
}

function StreakBadge({ streakDays }: Readonly<{ streakDays: number }>) {
  const { t } = useTranslation();

  return streakDays > 0 ? (
    <Label isCompact color="purple" icon={<FireIcon />}>
      {t('{{count}}-day streak', { count: streakDays })}
    </Label>
  ) : (
    <MetricLabel>{t('No active streak')}</MetricLabel>
  );
}

export function StreakDayStrip(
  props: Readonly<{
    title: string;
    streakDays: number;
    showLegend?: boolean;
    days: readonly StreakDay[];
    isSuccess: (day: StreakDay) => boolean;
    getRuns: (day: StreakDay) => number;
  }>
) {
  const { title, streakDays, showLegend, days, isSuccess, getRuns } = props;
  const { t } = useTranslation();
  return (
    <>
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsCenter' }}
        flexWrap={{ default: 'wrap' }}
        gap={{ default: 'gapMd' }}
      >
        <FlexItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <FlexItem>
              <div style={{ whiteSpace: 'nowrap' }}>
                <DashboardSectionHeading title={title} />
              </div>
            </FlexItem>
            <FlexItem>
              <StreakBadge streakDays={streakDays} />
            </FlexItem>
          </Flex>
        </FlexItem>
        {showLegend && (
          <FlexItem>
            <PageChartLegend
              id="automation-streak-legend"
              horizontal
              showLegendCount={false}
              legend={[
                { label: t('Successful job run'), color: STREAK_SUCCESS_COLOR },
                { label: t('No activity'), color: STREAK_EMPTY_COLOR },
              ]}
            />
          </FlexItem>
        )}
      </Flex>
      <Flex
        gap={{ default: 'gapXs' }}
        flexWrap={{ default: 'wrap' }}
        className="automation-dashboard-at-a-glance-streak-cells"
        style={{ marginTop: '0.5rem' }}
      >
        {days.map((day) => {
          const success = isSuccess(day);
          const runs = getRuns(day);
          return (
            <Tooltip
              key={day.dateStr}
              content={streakDayTooltipContent(day, success, runs, t)}
              position="top"
            >
              <div
                className={
                  success
                    ? 'streak-heat-cell streak-heat-cell--success'
                    : 'streak-heat-cell streak-heat-cell--empty'
                }
                aria-label={streakDayTooltipAriaLabel(day, success, runs, t)}
              />
            </Tooltip>
          );
        })}
      </Flex>
    </>
  );
}
