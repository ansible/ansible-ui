import { PageDashboardCard, PageDashboardCardWidth } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import {
  Divider,
  Flex,
  FlexItem,
  Icon,
  Label,
  Progress,
  SimpleList,
  SimpleListItem,
  Title,
} from '@patternfly/react-core';
import { CalendarAltIcon, ChartBarIcon, CrownIcon, CubesIcon } from '@patternfly/react-icons';
import { ReactNode, useState } from 'react';
import { MetricLabel, MetricValue } from './DashboardMetricsText';
import { LEADERBOARD_RANK_CROWN_CLASS, LeaderboardRankCell } from './LeaderboardRankCell';
import { DashboardSectionHeading } from './DashboardSectionHeading';
import {
  DimensionKey,
  DimensionStanding,
  HighlightsDimensionLeaderboardRow,
  useAutomationLeaderboardsView,
} from '../../views/useAutomationLeaderboardsView';
import { DEFAULT_NUMBER_LOCALE } from '../../constants/common';
import '../../AutomationDashboard.css';

const DIMENSION_ACCENT_COLOR = 'var(--pf-t--global--color--status--info--default)';
const DIMENSION_BAR_MAX_WIDTH = 180;

type DimensionMeta = {
  key: DimensionKey;
  title: string;
  /** Short, always-visible definition shown under the tile title. */
  description: string;
  icon: ReactNode;
  /** e.g. "job runs" — used in the ranked-list help text. */
  valueLabel: string;
};

function DimensionRow({
  meta,
  standing,
  isSelected,
  onSelect,
}: Readonly<{
  meta: DimensionMeta;
  standing: DimensionStanding;
  isSelected: boolean;
  onSelect: () => void;
}>) {
  const { t } = useTranslation();
  const { score, rank, totalRanked } = standing;

  return (
    <SimpleListItem
      className="automation-dashboard-dimension-row"
      isActive={isSelected}
      onClick={onSelect}
    >
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
        <FlexItem>
          {/* Icon's color comes from the wrapped SVG's own `color` (fill="currentColor"),
              not a style on <Icon> itself — PF's Icon content color is driven by an
              internal CSS variable that a plain inline style on the wrapper won't override. */}
          <Icon size="lg">{meta.icon}</Icon>
        </FlexItem>
        <FlexItem flex={{ default: 'flex_1' }}>
          <Title headingLevel="h4" size="lg" style={{ lineHeight: 1.3 }}>
            {meta.title}
          </Title>
          <MetricLabel>{meta.description}</MetricLabel>
        </FlexItem>
        <FlexItem style={{ textAlign: 'right' }}>
          <MetricValue>
            {rank <= 3 ? (
              <CrownIcon
                className={LEADERBOARD_RANK_CROWN_CLASS[rank as 1 | 2 | 3]}
                style={{ marginRight: 6, verticalAlign: '-0.05em' }}
              />
            ) : null}
            {score.toLocaleString(DEFAULT_NUMBER_LOCALE)}
          </MetricValue>
          <MetricLabel>{t('Rank {{rank}} of {{total}}', { rank, total: totalRanked })}</MetricLabel>
        </FlexItem>
      </Flex>
    </SimpleListItem>
  );
}

function DimensionBarListRow({
  row,
  rank,
  maxValue,
}: Readonly<{ row: HighlightsDimensionLeaderboardRow; rank: number; maxValue: number }>) {
  const { t } = useTranslation();
  const displayName = row.name;

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapMd' }}
      style={{ marginBottom: 10 }}
    >
      <FlexItem style={{ width: 56, flexShrink: 0 }}>
        <LeaderboardRankCell position={rank} />
      </FlexItem>
      <FlexItem style={{ width: 150, flexShrink: 0 }}>
        <span style={rank <= 3 ? { fontWeight: 700 } : undefined}>{displayName}</span>
        {row.isCurrentUser ? (
          <Label isCompact color="purple" style={{ marginLeft: 8 }}>
            {t('You')}
          </Label>
        ) : null}
      </FlexItem>
      <FlexItem grow={{ default: 'grow' }}>
        <Progress
          value={row.value}
          min={0}
          max={maxValue}
          measureLocation="none"
          size="sm"
          aria-label={t('{{name}} score', { name: displayName })}
          style={{ maxWidth: DIMENSION_BAR_MAX_WIDTH }}
        />
      </FlexItem>
      <FlexItem style={{ width: 64, flexShrink: 0, textAlign: 'right' }}>
        <span>{row.value.toLocaleString(DEFAULT_NUMBER_LOCALE)}</span>
      </FlexItem>
    </Flex>
  );
}

function DimensionBarList({ rows }: Readonly<{ rows: HighlightsDimensionLeaderboardRow[] }>) {
  const maxValue = rows[0]?.value ?? 0;

  return (
    <div className="automation-dashboard-dimension-bars">
      {rows.map((row, index) => (
        <DimensionBarListRow key={row.id} row={row} rank={index + 1} maxValue={maxValue} />
      ))}
    </div>
  );
}

export function AutomationDimensions(props: Readonly<{ width?: PageDashboardCardWidth }>) {
  const { t } = useTranslation();
  const title = t('Automation dimensions');
  const help = t(
    'Three scores that capture different aspects of your automation activity in the 30-day window. Rank is among all users on this platform. Ties are broken alphabetically.'
  );
  const subtitle = t('Click a dimension to update the leaderboard.');
  const { dimensions: dimensionStandings, dimensionLeaderboards } = useAutomationLeaderboardsView();
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey>('volume');

  const dimensions: DimensionMeta[] = [
    {
      key: 'volume',
      title: t('Volume'),
      description: t('Total number of successful job runs you triggered in the last 30 days'),
      icon: <ChartBarIcon style={{ color: DIMENSION_ACCENT_COLOR }} />,
      valueLabel: t('job runs'),
    },
    {
      key: 'breadth',
      title: t('Breadth'),
      description: t('Number of distinct job templates you executed in the last 30 days'),
      icon: <CubesIcon style={{ color: DIMENSION_ACCENT_COLOR }} />,
      valueLabel: t('distinct templates'),
    },
    {
      key: 'consistency',
      title: t('Consistency'),
      description: t('Number of days with at least one successful job run in the last 30 days'),
      icon: <CalendarAltIcon style={{ color: DIMENSION_ACCENT_COLOR }} />,
      valueLabel: t('active days'),
    },
  ];
  const selectedMeta = dimensions.find((dimension) => dimension.key === selectedDimension);
  return (
    <PageDashboardCard
      id={'automation-dimensions'}
      title={title}
      subtitle={subtitle}
      helpTitle={title}
      help={help}
      width={props.width ?? 'xxl'}
    >
      <Flex
        alignItems={{ default: 'alignItemsStretch' }}
        direction={{ default: 'column', '2xl': 'row' }}
      >
        <FlexItem flex={{ default: 'flex_1' }}>
          <SimpleList
            isControlled={false}
            aria-label={t('Automation dimensions')}
            className="automation-dashboard-dimension-list"
          >
            {dimensions.map((dimension) => (
              <DimensionRow
                key={dimension.key}
                meta={dimension}
                standing={dimensionStandings[dimension.key]}
                isSelected={dimension.key === selectedDimension}
                onSelect={() => setSelectedDimension(dimension.key)}
              />
            ))}
          </SimpleList>
        </FlexItem>
        <Divider
          orientation={{ default: 'horizontal', '2xl': 'vertical' }}
          inset={{ default: 'insetNone', '2xl': 'insetMd' }}
        />
        <FlexItem flex={{ default: 'flex_1' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <DashboardSectionHeading
              title={t('Top 10 — {{dimension}}', { dimension: selectedMeta?.title })}
              help={t(
                'Top 10 users ranked by {{label}} in the last 30 days. You are shown in the list if you are in the top 10. Ties are broken alphabetically.',
                { label: selectedMeta?.valueLabel }
              )}
            />
            <MetricLabel>{selectedMeta?.description}</MetricLabel>
          </div>
          {selectedMeta && <DimensionBarList rows={dimensionLeaderboards[selectedMeta.key]} />}
        </FlexItem>
      </Flex>
    </PageDashboardCard>
  );
}
