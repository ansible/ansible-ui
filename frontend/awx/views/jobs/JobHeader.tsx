import {
  PageActions,
  PageHeader,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { Flex, FlexItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { awxAPI } from '../../common/api/awx-utils';
import { Job } from '../../interfaces/Job';
import { WorkflowJobNode } from '../../interfaces/WorkflowNode';
import { AwxRoute } from '../../main/AwxRoutes';
import { useGetJob } from './JobPage';
import { WorkflowOutputNavigation } from './WorkflowOutputNavigation';
import { useJobHeaderActions } from './hooks/useJobHeaderActions';

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
            <PageActions<Job> actions={actions} position={'right'} selectedItem={job} />
          </FlexItem>
        </Flex>
      }
    />
  );
}
