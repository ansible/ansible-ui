import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PageActions, PageHeader, useGetPageUrl, usePageNavigate } from '../../../../framework';
import { useJobHeaderActions } from './hooks/useJobHeaderActions';
import { Job } from '../../interfaces/Job';
import { AwxRoute } from '../../main/AwxRoutes';
import { useTranslation } from 'react-i18next';
import { useGetJob } from './JobPage';
import { useParams } from 'react-router-dom';
import { WorkflowOutputNavigation } from './WorkflowOutputNavigation';
import { Flex, FlexItem } from '@patternfly/react-core';
import { useGet } from '../../../common/crud/useGet';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { awxAPI } from '../../common/api/awx-utils';
import { WorkflowJobNode } from '../../interfaces/WorkflowNode';

export function JobHeader() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; job_type: string }>();
  const { job } = useGetJob(params.id, params.job_type);

  const wfJobId = job?.summary_fields?.source_workflow_job?.id;
  const { data: workflowNodes } = useGet<AwxItemsResponse<WorkflowJobNode>>(
    wfJobId ? awxAPI`/workflow_jobs/${wfJobId.toString()}/workflow_nodes/` : ''
  );

  const relevantNodes =
    workflowNodes?.results.filter(
      ({ job, summary_fields }) =>
        job && job.toString() !== id && summary_fields?.job?.type !== 'workflow_approval'
    ) ?? [];

  const actions = useJobHeaderActions(() => pageNavigate(AwxRoute.Jobs));
  return (
    <PageHeader
      title={job?.name}
      breadcrumbs={[{ label: t('Jobs'), to: getPageUrl(AwxRoute.Jobs) }, { label: job?.name }]}
      headerActions={
        <Flex>
          {relevantNodes?.length > 0 && (
            <FlexItem>
              <WorkflowOutputNavigation workflowNodes={relevantNodes} />
            </FlexItem>
          )}
          <FlexItem>
            <PageActions<Job>
              actions={actions}
              position={DropdownPosition.right}
              selectedItem={job}
            />
          </FlexItem>
        </Flex>
      }
    />
  );
}
