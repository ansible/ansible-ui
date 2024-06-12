/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { useGetItem, useGet } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useWorkflowApprovalsRowActions } from '../hooks/useWorkflowApprovalsRowActions';
import { Job } from '../../../interfaces/Job';
import { useViewActivityStream } from '../../../access/common/useViewActivityStream';

export function WorkflowApprovalPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error: workflowApprovalError,
    data: workflowApproval,
    refresh,
  } = useGetItem<WorkflowApproval>(awxAPI`/workflow_approvals`, params.id);

  const workflowJobId = workflowApproval?.summary_fields?.source_workflow_job?.id;
  const { data: workflowJob, error: workflowJobError } = useGet<Job>(
    workflowJobId ? awxAPI`/workflow_jobs/${workflowJobId.toString()}/` : ''
  );

  const getPageUrl = useGetPageUrl();
  const activityStream = useViewActivityStream();
  const actions = useWorkflowApprovalsRowActions(refresh);

  const error = workflowApprovalError || workflowJobError;
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!workflowApproval || !workflowJob) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={workflowApproval?.name}
        breadcrumbs={[
          { label: t('Workflow Approvals'), to: getPageUrl(AwxRoute.WorkflowApprovals) },
          { label: workflowApproval?.name },
        ]}
        headerActions={
          <PageActions
            actions={[...activityStream, ...actions]}
            position={DropdownPosition.right}
            selectedItem={workflowApproval}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Workflow Approvals'),
          page: AwxRoute.WorkflowApprovals,
          persistentFilterKey: 'workflow-approvals',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.WorkflowApprovalDetails },
          { label: t('Workflow Job Details'), page: AwxRoute.WorkflowApprovalWorkflowJobDetails },
        ]}
        params={{
          id: params.id || 0,
          job_id: workflowApproval?.summary_fields?.workflow_job?.id,
          job_type: 'workflow',
        }}
        componentParams={{ job: workflowJob }}
      />
    </PageLayout>
  );
}
