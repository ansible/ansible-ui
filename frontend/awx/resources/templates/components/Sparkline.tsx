import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { Tooltip } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { StatusCell } from '../../../../common/Status';
import { SummaryFieldRecentJob } from '../../../interfaces/summary-fields/summary-fields';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';

const Wrapper = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
`;
export const Sparkline = ({ jobs }: { jobs: SummaryFieldRecentJob[] | undefined }) => {
  const { t } = useTranslation();
  const getJobOutputUrl = useGetJobOutputUrl();
  const generateTooltip = (job: SummaryFieldRecentJob) => (
    <>
      <div>
        {t`JOB ID:`} {job.id}
      </div>
      <div>
        {t`STATUS:`} {job.status?.toUpperCase()}
      </div>
      {job.finished && (
        <div>
          {t`FINISHED:`} {formatDateString(job.finished)}
        </div>
      )}
    </>
  );

  const statusIcons = jobs?.map((job) => (
    <Tooltip position="top" content={generateTooltip(job)} key={job.id}>
      <Link aria-label={t(`View job ${job.id}`)} to={getJobOutputUrl(job as UnifiedJob)}>
        <StatusCell status={job.status} hideLabel={true} />
      </Link>
    </Tooltip>
  ));

  return <Wrapper>{statusIcons}</Wrapper>;
};
