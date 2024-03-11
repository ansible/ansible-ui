/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useWorkflowApprovalsRowActions } from '../hooks/useWorkflowApprovalsRowActions';

export function WorkflowApprovalPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: workflowApproval,
    refresh,
  } = useGetItem<WorkflowApproval>(awxAPI`/workflow_approvals`, params.id);
  const getPageUrl = useGetPageUrl();

  const actions = useWorkflowApprovalsRowActions(refresh);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!workflowApproval) return <LoadingPage breadcrumbs tabs />;

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
            actions={actions}
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
          { label: t('Workflow job details'), page: AwxRoute.WorkflowApprovalWorkflowJobDetails },
        ]}
        params={{
          id: params.id || 0,
          job_id: workflowApproval?.summary_fields?.workflow_job?.id,
          job_type: 'workflow',
        }}
      />
    </PageLayout>
  );
}
