import {
  ITableColumn,
  PageDashboardCard,
  PageDashboardCardWidth,
  PageTable,
} from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { CrownIcon } from '@patternfly/react-icons';
import { LEADERBOARD_RANK_CROWN_CLASS, LeaderboardRankCell } from './LeaderboardRankCell';
import { Label, Truncate } from '@patternfly/react-core';
import { DEFAULT_NUMBER_LOCALE } from '../../constants/common';
import {
  LeaderboardItem,
  useAutomationLeaderboardsView,
} from '../../views/useAutomationLeaderboardsView';

function LeaderboardRankSummary({
  rank,
  rankText,
  runsText,
}: Readonly<{ rank: number; rankText: string; runsText: string }>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
      <div style={{ textAlign: 'right', fontSize: 12, whiteSpace: 'nowrap' }}>
        <div style={{ fontWeight: 600 }}>{rankText}</div>
        <div style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>{runsText}</div>
      </div>
      {rank <= 3 ? (
        <CrownIcon
          className={LEADERBOARD_RANK_CROWN_CLASS[rank as 1 | 2 | 3]}
          style={{ fontSize: 30, flexShrink: 0 }}
        />
      ) : null}
    </div>
  );
}

export function HighlightsLeaderboardPanel(props: Readonly<{ width?: PageDashboardCardWidth }>) {
  const { t } = useTranslation();
  const title = t('Top 10 organizations');
  const help = t(
    'Top 10 organizations ranked by total successful job runs in the last 30 days. Ties are broken alphabetically.'
  );
  const { organizationLeaderboard: items, currentOrgStanding } = useAutomationLeaderboardsView();

  const rankCell = (item: LeaderboardItem) => <LeaderboardRankCell position={item.rank} />;
  const nameCell = (item: LeaderboardItem) => (
    <>
      <Truncate content={item.name} style={item.rank <= 3 ? { fontWeight: 700 } : undefined} />
      {item.isCurrentOrg && (
        <Label isCompact color="purple" style={{ marginLeft: 8 }}>
          {t('Your org')}
        </Label>
      )}
    </>
  );
  const tableColumns: ITableColumn<LeaderboardItem>[] = [
    {
      header: t('Rank'),
      cell: (item) => rankCell(item),
    },
    {
      header: t('Organization'),
      cell: (item) => nameCell(item),
      fullWidth: true,
    },
    {
      header: t('Total successful job runs'),
      cell: (item) => item.runs.toLocaleString(DEFAULT_NUMBER_LOCALE),
    },
  ];
  const keyFn = (item: LeaderboardItem) => item.id;

  return (
    <PageDashboardCard
      id={'highlights-leaderboard-card'}
      title={title}
      helpTitle={title}
      help={help}
      width={props.width ?? 'lg'}
      disableBodyPadding
      headerControls={
        <LeaderboardRankSummary
          rank={currentOrgStanding.rank}
          rankText={t("Your org's rank: #{{rank}}", { rank: currentOrgStanding.rank })}
          runsText={t('{{runs}} job runs', {
            runs: currentOrgStanding.totalRuns.toLocaleString(DEFAULT_NUMBER_LOCALE),
          })}
        />
      }
    >
      <PageTable
        autoHidePagination
        disableBodyPadding
        pageItems={items}
        tableColumns={tableColumns}
        itemCount={items.length}
        compact
        keyFn={keyFn}
        disableLastRowBorder
        page={1}
        perPage={10}
        setPage={() => {}}
        setPerPage={() => {}}
        errorStateTitle={t('Error loading leaderboard')}
      ></PageTable>
    </PageDashboardCard>
  );
}
