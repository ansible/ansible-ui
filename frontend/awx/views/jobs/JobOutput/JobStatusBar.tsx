import { useTranslation } from 'react-i18next';
import { Split, SplitItem, Flex, FlexItem, Label, Badge } from '@patternfly/react-core';
import { Job } from '../../../interfaces/Job';

export function JobStatusBar(props: { job: Job }) {
  const { job } = props;
  const { t } = useTranslation();

  const playCount = job.playbook_counts?.play_count;
  const taskCount = job.playbook_counts?.task_count;
  const darkCount = job.host_status_counts?.dark;
  const failureCount = job.host_status_counts?.failures;
  const totalHostCount = job.host_status_counts
    ? Object.keys(job.host_status_counts || {}).reduce(
        (sum, key) => sum + job.host_status_counts[key],
        0
      )
    : 0;

  return (
    <Split hasGutter>
      <SplitItem isFilled>{job.name}</SplitItem>
      <SplitItem>
        <Flex>
          <Count label={t('Plays')} count={playCount} />
          <Count label={t('Tasks')} count={taskCount} />
          <Count label={t('Hosts')} count={totalHostCount} />
          <Count label={t('Unreachable')} count={darkCount} />
          <Count label={t('Failed')} count={failureCount} />
          <FlexItem>
            {t('Elapsed')} <Label>{job.elapsed}</Label>
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
