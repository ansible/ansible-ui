import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Badge, Tooltip } from '@patternfly/react-core';
import {
  pfSuccess,
  pfDanger,
  pfWarning,
  pfInfo,
} from '../../../../../framework/components/pfcolors';
import type { HostStatusCounts } from '../../../interfaces/Job';

const BarWrapper = styled.div`
  background-color: var(--pf-global--Color--light-300);
  display: flex;
  height: 7px;
  margin-top: 16px;
  margin-bottom: 8px;
  width: 100%;
`;

const BarSegment = styled.div`
  background-color: ${(props) => props.color || 'inherit'};
  flex-grow: ${(props: { count: number }) => props.count || 0};
`;
BarSegment.displayName = 'BarSegment';

const TooltipContent = styled.div`
  align-items: center;
  display: flex;

  span.pf-c-badge {
    margin-left: 10px;
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  justify-content: end;
  font-size: var(--pf-global--FontSize--sm);
`;
const LegendBox = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: ${(props) => props.color};
  margin-right: 8px;
`;

type StatusCountType = 'ok' | 'skipped' | 'changed' | 'failures' | 'dark';
type HostStatusType = { [key in StatusCountType]: { color: string; label: string } };

export function HostStatusBar(props: { counts: HostStatusCounts }) {
  const { t } = useTranslation();
  const { counts } = props;
  const noData = Object.keys(counts).length === 0;
  const totalCounts = Object.values(counts).reduce(
    (sum: number, count: number) => sum + count,
    0
  ) as number;
  const hostStatus: HostStatusType = {
    ok: {
      color: pfSuccess,
      label: t`Success`,
    },
    skipped: {
      color: pfInfo,
      label: t`Skipped`,
    },
    changed: {
      color: pfWarning,
      label: t`Changed`,
    },
    failures: {
      color: pfDanger,
      label: t`Failed`,
    },
    dark: {
      color: 'var(--pf-global--danger-color--300)',
      label: t`Unreachable`,
    },
  };

  const barSegments = Object.keys(hostStatus).map((key) => {
    const count = counts[key as StatusCountType] || 0;
    const status = hostStatus[key as StatusCountType];
    return (
      <Tooltip
        key={key}
        content={
          <TooltipContent>
            {status.label}
            <Badge isRead>{count}</Badge>
          </TooltipContent>
        }
      >
        <BarSegment key={key} color={status.color} count={count} />
      </Tooltip>
    );
  });

  if (noData) {
    return (
      <BarWrapper>
        <Tooltip content={t`Host status information for this job is unavailable.`}>
          <BarSegment count={1} />
        </Tooltip>
      </BarWrapper>
    );
  }

  return (
    <>
      <BarWrapper>{barSegments}</BarWrapper>
      <Legend>
        {Object.keys(counts).map((key) => (
          <LegendItem
            key={key}
            color={hostStatus[key as StatusCountType].color}
            label={hostStatus[key as StatusCountType].label}
            percent={(counts[key as StatusCountType] || 0 / totalCounts) * 100}
          />
        ))}
      </Legend>
    </>
  );
}

function LegendItem(props: { color: string; label: string; percent: number }) {
  const { color, label, percent } = props;

  return (
    <div>
      <LegendBox color={color} />
      {label} {Math.round(percent)}%
    </div>
  );
}
