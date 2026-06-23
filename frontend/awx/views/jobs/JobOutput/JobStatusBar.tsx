import {
  IPageActionButton,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageActionButton } from '@ansible/ansible-ui-framework/PageActions/PageActionButton';
import { StatusCell } from '@ansible/common-ui/Status';
import {
  Badge,
  ButtonVariant,
  Flex,
  FlexItem,
  Label,
  Split,
  SplitItem,
  Tooltip,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, ProjectDiagramIcon } from '@patternfly/react-icons';
import { DateTime, Duration } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Job } from '../../../interfaces/Job';
import { AwxRoute } from '../../../main/AwxRoutes';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { JobEvent } from '../../../interfaces/JobEvent';
import { useGet } from '@ansible/common-ui/crud/useGet';

const HeaderTitle = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 10px;

  h1 {
    font-weight: var(--pf-t--global--font--weight--body--bold);
  }
`;

export function JobStatusBar(props: Readonly<{ job: Job }>) {
  const { job } = props;
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const [activeJobElapsedTime, setActiveJobElapsedTime] = useState('00:00:00');
  const [playbookStarted, setPlaybookStarted] = useState(false);

  const eventsSlug = job.type === 'job' ? 'job_events' : 'events';

  const jobFinished = job.finished;
  const refreshInterval = useCallback(
    (latestData: AwxItemsResponse<JobEvent>) => {
      if (jobFinished) return 0;
      if (latestData?.results.length) {
        const latestEvent = latestData.results[0];
        if (latestEvent.event === 'playbook_on_start') {
          return 0;
        }
      }
      return 5000;
    },
    [jobFinished]
  );

  const { data: jobEvents } = useGet<AwxItemsResponse<JobEvent>>(
    awxAPI`/${job.type}s/${job.id.toString()}/${eventsSlug}/`,
    {
      page_size: 1,
      counter: 1,
      count_disabled: 1,
    },
    { refreshInterval }
  );

  const event = jobEvents?.results[0]?.event;

  useEffect(() => {
    if (event === 'playbook_on_start') {
      setPlaybookStarted(true);
    }
  }, [event]);

  useEffect(() => {
    let secTimer: ReturnType<typeof setInterval>; // eslint-disable-line prefer-const
    if (job.finished) {
      return () => clearInterval(secTimer);
    }

    secTimer = setInterval(() => {
      const elapsedTime = calculateElapsed(job.started);
      setActiveJobElapsedTime(elapsedTime);
    }, 1000);

    return () => clearInterval(secTimer);
  }, [job.started, job.finished]);

  const playCount = job.playbook_counts?.play_count;
  const taskCount = job.playbook_counts?.task_count;
  const darkCount = job.host_status_counts?.dark;
  const failureCount = job.host_status_counts?.failures;
  const totalHostCount = job.host_status_counts
    ? Object.keys(job.host_status_counts || {}).reduce(
        (sum, key) => sum + (job.host_status_counts[key as 'ok' | 'failures' | 'dark'] as number),
        0
      )
    : 0;

  const elapsed = job.finished
    ? Duration.fromObject({ seconds: Number(job.elapsed) }).toFormat('hh:mm:ss')
    : activeJobElapsedTime;

  const viewWFVisAction = useMemo<IPageActionButton>(
    () => ({
      type: PageActionType.Button,
      selection: PageActionSelection.None,
      variant: ButtonVariant.primary,
      icon: ProjectDiagramIcon,
      label: t('View workflow visualizer'),
      onClick: () =>
        pageNavigate(AwxRoute.WorkflowVisualizer, {
          params: { id: job.unified_job_template },
        }),
    }),
    [t, job.unified_job_template, pageNavigate]
  );

  return (
    <Split hasGutter>
      <SplitItem isFilled>
        <Flex>
          <HeaderTitle>
            <h1>{job.name}</h1>
            <StatusCell status={job.status} />
          </HeaderTitle>
          {!playbookStarted && job?.status === 'running' && (
            <Tooltip
              content={t(
                'Setting up the job now. This involves retrieving the execution environment image' +
                  ' and preparing the playbook. Playbook output will be displayed shortly.'
              )}
            >
              <Label
                data-cy="waiting-label"
                data-testid="waiting-label"
                variant="outline"
                color={'orange'}
                icon={<ExclamationCircleIcon />}
              >
                {t('Running initial setup. Waiting to execute playbook')}
              </Label>
            </Tooltip>
          )}
        </Flex>
      </SplitItem>
      <SplitItem>
        <Flex>
          {job.type === 'workflow_job' && <PageActionButton iconOnly action={viewWFVisAction} />}
          <Count label={t('Plays')} count={playCount} />
          <Count label={t('Tasks')} count={taskCount} />
          <Count label={t('Hosts')} count={totalHostCount} />
          <Count label={t('Unreachable')} count={darkCount} />
          <Count label={t('Failed')} count={failureCount} />
          <FlexItem>
            {t('Elapsed')} <Badge isRead>{elapsed}</Badge>
          </FlexItem>
        </Flex>
      </SplitItem>
    </Split>
  );
}

function Count(props: Readonly<{ label: string; count?: number }>) {
  const { label, count } = props;
  if (!count) {
    return null;
  }

  return (
    <FlexItem>
      {label} <Badge isRead>{count}</Badge>
    </FlexItem>
  );
}

const calculateElapsed = (started: string | undefined) => {
  if (!started) {
    return '';
  }

  const now = DateTime.now();
  const duration = now
    .diff(DateTime.fromISO(`${started}`), ['milliseconds', 'seconds', 'minutes', 'hours'])
    .toObject();

  return Duration.fromObject({ ...duration }).toFormat('hh:mm:ss');
};
