import { Label } from '@patternfly/react-core';
import { CrownIcon } from '@patternfly/react-icons';

const RANK_LABEL_COLORS = {
  1: 'yellow',
  2: 'grey',
  3: 'orange',
} as const;

/** Shared gold/silver/bronze crown-color classes — reused anywhere else a #1-#3 rank needs a crown. */
export const LEADERBOARD_RANK_CROWN_CLASS = {
  1: 'automation-dashboard-leaderboard-rank-crown--1',
  2: 'automation-dashboard-leaderboard-rank-crown--2',
  3: 'automation-dashboard-leaderboard-rank-crown--3',
} as const;

/** Medal-styled rank cell shared by the main leaderboard and per-dimension leaderboards. */
export function LeaderboardRankCell({ position }: Readonly<{ position: number }>) {
  if (position <= 3) {
    const color = RANK_LABEL_COLORS[position as 1 | 2 | 3];
    return (
      <Label
        variant="outline"
        color={color}
        isCompact
        icon={<CrownIcon className={LEADERBOARD_RANK_CROWN_CLASS[position as 1 | 2 | 3]} />}
      >
        {`#${position}`}
      </Label>
    );
  }

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: 24, display: 'inline-block' }}>
      #{position}
    </span>
  );
}
