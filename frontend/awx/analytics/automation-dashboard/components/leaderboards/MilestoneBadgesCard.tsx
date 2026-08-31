import { useTranslation } from 'react-i18next';
import { PageDashboardCard, PageDashboardCardWidth } from '@ansible/ansible-ui-framework';
import { DashboardSectionHeading } from './DashboardSectionHeading';
import { Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import React, { useMemo } from 'react';
import {
  ArrowUpIcon,
  BoltIcon,
  CalendarWeekIcon,
  ChartLineIcon,
  CheckCircleIcon,
  CompassIcon,
  CrownIcon,
  RocketIcon,
  TrophyIcon,
} from '@patternfly/react-icons';
import {
  MilestoneBadgeId,
  OrgBadgeId,
  useAutomationLeaderboardsView,
} from '../../views/useAutomationLeaderboardsView';

type BadgeId = MilestoneBadgeId | OrgBadgeId;

type Badge<Id extends BadgeId = BadgeId> = {
  id: Id;
  label: string;
  rule: string;
  icon: React.ReactNode;
};

type BadgeConfig = Badge<MilestoneBadgeId>;

type OrgBadgeConfig = Badge<OrgBadgeId>;

function sortEarnedFirst<T extends Badge>(badges: T[], earnedIds: readonly BadgeId[]): T[] {
  const earnedSet = new Set(earnedIds);
  return badges
    .map((badge, index) => ({ badge, index }))
    .sort((a, b) => {
      const aEarned = earnedSet.has(a.badge.id);
      const bEarned = earnedSet.has(b.badge.id);
      if (aEarned !== bEarned) return aEarned ? -1 : 1;
      return a.index - b.index;
    })
    .map(({ badge }) => badge);
}

function useMilestoneBadgeConfig(): BadgeConfig[] {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        id: 'ignition',
        label: t('Ignition'),
        rule: t('Ran your first successful job in the current 30-day window.'),
        icon: <BoltIcon />,
      },
      {
        id: 'weekWarrior',
        label: t('Week Warrior'),
        rule: t('Ran at least one successful job on 7 consecutive UTC calendar days.'),
        icon: <CalendarWeekIcon />,
      },
      {
        id: 'monthWarrior',
        label: t('Month Warrior'),
        rule: t('Ran at least one successful job on all 30 calendar days in the window.'),
        icon: <TrophyIcon />,
      },
      {
        id: 'explorer',
        label: t('Explorer'),
        rule: t('Ran jobs using 5 or more distinct templates in the window.'),
        icon: <CompassIcon />,
      },
      {
        id: 'centurion',
        label: t('Centurion'),
        rule: t('Ran 100 or more successful jobs in the window.'),
        icon: <ChartLineIcon />,
      },
      {
        id: 'reliable',
        label: t('Reliable'),
        rule: t('Ran 20 or more consecutive successful jobs with no failures in between.'),
        icon: <CheckCircleIcon />,
      },
      {
        id: 'accelerator',
        label: t('Accelerator'),
        rule: t('Ran more jobs in the second half of the 30-day window than the first half.'),
        icon: <RocketIcon />,
      },
    ],
    [t]
  );
}
function useOrgBadgeConfig(): OrgBadgeConfig[] {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        id: 'sustained' as OrgBadgeId,
        label: t('Sustained'),
        rule: t('14 or more consecutive org streak days in the current 30-day window.'),
        icon: <CalendarWeekIcon />,
      },
      {
        id: 'rising' as OrgBadgeId,
        label: t('Rising'),
        rule: t('More jobs in days 16–30 than days 1–15 of the window.'),
        icon: <ArrowUpIcon />,
      },
      {
        id: 'topTier' as OrgBadgeId,
        label: t('Top Tier'),
        rule: t('Org ranked #1, #2, or #3 at any sync point in the window.'),
        icon: <CrownIcon />,
      },
    ],
    [t]
  );
}

function MilestoneBadge<T extends Badge>({
  badge,
  earned,
}: Readonly<{
  badge: T;
  earned: boolean;
}>) {
  const tooltipContent = (
    <>
      <strong>{badge.label}</strong>
      <br />
      {badge.rule}
    </>
  );

  return (
    <Tooltip content={tooltipContent} position="bottom">
      <div
        className={
          earned
            ? 'achievement-badge achievement-badge--earned achievement-badge--milestone'
            : 'achievement-badge achievement-badge--locked achievement-badge--milestone'
        }
        aria-label={badge.label}
      >
        <span className="achievement-badge__stars" aria-hidden />
        <span className="achievement-badge__icon">{badge.icon}</span>
        <span className="achievement-badge__label">{badge.label}</span>
      </div>
    </Tooltip>
  );
}

function MilestoneBadgeGrid<T extends Badge>({
  badges,
  earnedIds,
}: Readonly<{
  badges: T[];
  earnedIds: readonly BadgeId[];
}>) {
  const earnedSet = useMemo(() => new Set(earnedIds), [earnedIds]);
  const sortedBadges = useMemo(() => sortEarnedFirst(badges, earnedIds), [badges, earnedIds]);

  return (
    <div className={'achievement-badges-grid--milestone'}>
      {sortedBadges.map((badge) => (
        <MilestoneBadge key={badge.id} badge={badge} earned={earnedSet.has(badge.id)} />
      ))}
    </div>
  );
}

function BadgeShelf<T extends Badge>({
  title,
  help,
  earnedIds,
  badges,
}: Readonly<{
  title: string;
  help: string;
  earnedIds: readonly BadgeId[];
  badges: T[];
}>) {
  return (
    <>
      <DashboardSectionHeading title={title} help={help} />
      <MilestoneBadgeGrid badges={badges} earnedIds={earnedIds} />
    </>
  );
}

export function MilestoneBadgesCard(props: Readonly<{ width?: PageDashboardCardWidth }>) {
  const { t } = useTranslation();
  const title = t('30-day achievements');
  const help = t(
    'Recognitions earned in the current 30-day window. Achievements reset when the window rolls — re-earn them each period. Earned achievements appear first.'
  );
  const badges = useMilestoneBadgeConfig();
  const orgBadges = useOrgBadgeConfig();
  const { earnedUserAchievements, earnedOrgAchievements } = useAutomationLeaderboardsView();
  const subTitle = t('These achievements reset every 30 days.');
  return (
    <PageDashboardCard
      id={'milestone-badges-card'}
      title={title}
      helpTitle={title}
      help={help}
      subtitle={subTitle}
      width={props.width ?? 'md'}
    >
      <Flex
        direction={{ default: 'column' }}
        flexWrap={{ default: 'nowrap' }}
        gap={{ default: 'gapMd' }}
      >
        <FlexItem>
          <BadgeShelf
            title={t('Your achievements')}
            help={t('Achievements you earned in the current 30-day window.')}
            earnedIds={earnedUserAchievements}
            badges={badges}
          />
        </FlexItem>
        <FlexItem>
          <BadgeShelf
            title={t("Your org's achievements")}
            help={t(
              'Achievements any of the organizations you belong to earned in the current 30-day window. Visible to all members of your org.'
            )}
            earnedIds={earnedOrgAchievements}
            badges={orgBadges}
          />
        </FlexItem>
      </Flex>
    </PageDashboardCard>
  );
}
