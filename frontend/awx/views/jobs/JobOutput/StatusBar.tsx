import { Badge, Tooltip } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  pfDanger,
  pfInfo,
  pfSuccess,
  pfUnreachable,
  pfWarning,
} from '../../../../../framework/components/pfcolors';
import type { HostStatusCounts } from '../../../interfaces/Job';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { JobStatus } from './util';

const BarWrapper = styled.div`
  background-color: var(--pf-v5-global--Color--light-300);
  display: flex;
  min-height: 7px;
  margin-top: 16px;
  margin-bottom: 8px;
  width: 100%;
`;

const BarSegment = styled.div<{ count: number }>`
  background-color: ${(props) => props.color || 'inherit'};
  flex-grow: ${(props: { count: number }) => props.count || 0};
`;
BarSegment.displayName = 'BarSegment';

const TooltipContent = styled.div`
  align-items: center;
  display: flex;

  span.pf-v5-c-badge {
    margin-left: 10px;
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  justify-content: end;
  font-size: var(--pf-v5-global--FontSize--sm);
`;
const LegendBox = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: ${(props) => props.color};
  margin-right: 8px;
`;

interface StatusProps {
  color: string;
  label: string;
}

type HostStatusCountType = 'ok' | 'skipped' | 'changed' | 'failures' | 'dark';
type WorkflowStatusCountType = JobStatus | 'dark';

type CommonStatusType = Record<'dark', StatusProps>;
type HostStatusType = Record<HostStatusCountType, StatusProps>;
type WorkflowStatusType = Record<WorkflowStatusCountType, StatusProps>;

type WFNodesStatusProps = Partial<Record<WorkflowStatusCountType, number>>;

export function WorkflowNodesStatusBar(props: { nodes: WorkflowNode[] }) {
  const { t } = useTranslation();

  const workflowStatus: WorkflowStatusType = {
    successful: {
      color: pfSuccess,
      label: t`Success`,
    },
    canceled: {
      color: pfWarning,
      label: t`Canceled`,
    },
    new: {
      color: pfInfo,
      label: t`New`,
    },
    pending: {
      color: pfInfo,
      label: t`Pending`,
    },
    waiting: {
      color: pfInfo,
      label: t`Waiting`,
    },
    running: {
      color: pfInfo,
      label: t`Running`,
    },
    error: {
      color: pfDanger,
      label: t`Error`,
    },
    failed: {
      color: pfDanger,
      label: t`Failed`,
    },
    dark: {
      color: pfUnreachable,
      label: t`Unreachable`,
    },
  };

  const segments: WFNodesStatusProps = {};

  props.nodes.map((node) => {
    const nodeStatus = (node?.summary_fields?.job?.status ?? 'dark') as WorkflowStatusCountType;

    const nodeVal = segments[nodeStatus];
    segments[nodeStatus] = nodeStatus in segments && nodeVal ? nodeVal + 1 : 1;
  });

  return <StatusBar counts={segments} status={workflowStatus} />;
}

export function HostStatusBar(props: { counts: HostStatusCounts }) {
  const { t } = useTranslation();

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
      color: pfUnreachable,
      label: t`Unreachable`,
    },
  };

  return <StatusBar counts={props.counts} status={hostStatus} />;
}

interface StatusBarProps<T extends object, K> {
  counts: T;
  status: K;
}

function StatusBar<T extends object, K extends object>(props: StatusBarProps<T, K>) {
  const { t } = useTranslation();
  const { counts, status } = props;
  const noData = Object.keys(counts).length === 0;
  const totalCounts = Object.values(counts).reduce(
    (sum: number, count: number) => sum + count,
    0
  ) as number;

  const barSegments = Object.keys(status).map((key) => {
    const count = (counts[key as keyof T] as number) || 0;
    const jobStatus =
      (status[key as keyof K] as StatusProps) ?? (status as CommonStatusType)['dark'];
    return (
      <Tooltip
        key={key}
        content={
          <TooltipContent>
            {jobStatus.label}
            <Badge isRead>{count}</Badge>
          </TooltipContent>
        }
      >
        <BarSegment key={key} color={jobStatus.color} count={count} />
      </Tooltip>
    );
  });

  if (noData) {
    return (
      <BarWrapper data-cy="status-bar">
        <Tooltip content={t`Host status information for this job is unavailable.`}>
          <BarSegment count={1} />
        </Tooltip>
      </BarWrapper>
    );
  }

  return (
    <>
      <BarWrapper data-cy="status-bar">{barSegments}</BarWrapper>
      <Legend>
        {Object.keys(counts).map((key) => (
          <LegendItem
            key={key}
            color={
              (status[key as keyof K] as StatusProps)?.color ??
              (status as CommonStatusType)['dark'].color
            }
            label={
              (status[key as keyof K] as StatusProps)?.label ??
              (status as CommonStatusType)['dark'].label
            }
            percent={(((counts[key as keyof T] as number) ?? 0) / totalCounts) * 100}
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
