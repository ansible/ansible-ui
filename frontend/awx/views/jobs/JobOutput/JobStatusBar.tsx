import { Badge, Flex, FlexItem, Split, SplitItem, ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { DateTime, Duration } from 'luxon';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { StatusLabel } from '../../../../common/Status';
import { Job } from '../../../interfaces/Job';
import { PageActionType, IPageActionButton, PageActionSelection } from '../../../../../framework';
import { PageActionButton } from '../../../../../framework/PageActions/PageActionButton';
import { useCancelJobs } from '../hooks/useCancelJobs';
import { isJobRunning } from './util';
import { cannotCancelJob } from '../hooks/useJobHeaderActions';

const HeaderTitle = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 10px;

  h1 {
    font-weight: var(--pf-v5-global--FontWeight--bold);
  }
`;

export function JobStatusBar(props: { job: Job; reloadJob: () => void }) {
  const { job, reloadJob } = props;
  const { t } = useTranslation();
  const [activeJobElapsedTime, setActiveJobElapsedTime] = useState('00:00:00');
  const cancelJobs = useCancelJobs(() => {
    reloadJob();
  });

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

  const cancelJobAction = useMemo<IPageActionButton>(
    () => ({
      type: PageActionType.Button,
      selection: PageActionSelection.None,
      variant: ButtonVariant.secondary,
      icon: MinusCircleIcon,
      label: t(`Cancel job`),
      isDisabled: () => cannotCancelJob(job, t),
      onClick: () => cancelJobs([job]),
    }),
    [t, job, cancelJobs]
  );

  return (
    <Split hasGutter>
      <SplitItem isFilled>
        <HeaderTitle>
          <h1>{job.name}</h1>
          <StatusLabel status={job.status} />
        </HeaderTitle>
      </SplitItem>
      <SplitItem>
        <Flex>
          {job.type === 'workflow_job' && isJobRunning(job?.status) && (
            <PageActionButton iconOnly action={cancelJobAction} />
          )}
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

function Count(props: { label: string; count?: number }) {
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
