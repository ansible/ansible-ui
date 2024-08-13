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
  const JOB_TYPE_URL_SEGMENTS: { [char: string]: string } = {
    job: 'playbook',
    project_update: 'project',
    system_job: 'management',
    inventory_update: 'inventory',
    ad_hoc_command: 'command',
    workflow_job: 'workflow',
  };
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

  const statusIcons = jobs?.map((job) => {
    const jobOutputUrl = getJobOutputUrl(job as UnifiedJob);
    return (
      <Tooltip position="top" content={generateTooltip(job)} key={job.id}>
        <Link
          aria-label={t(`View job ${job.id}`)}
          to={
            jobOutputUrl
              ? jobOutputUrl
              : `/jobs/${JOB_TYPE_URL_SEGMENTS[job.type]}/${job.id}/output`
          }
        >
          <StatusCell status={job.status} hideLabel={true} />
        </Link>
      </Tooltip>
    );
  });

  return <Wrapper>{statusIcons}</Wrapper>;
};
