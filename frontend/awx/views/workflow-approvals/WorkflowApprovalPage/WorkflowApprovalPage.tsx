/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { AwxRoute } from '../../../AwxRoutes';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';

export function WorkflowApprovalPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: workflow_approval,
    refresh,
  } = useGetItem<WorkflowApproval>('/api/v2/workflow_approvals', params.id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!workflow_approval) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={workflow_approval?.name}
        breadcrumbs={[
          { label: t('Workflow Approvals'), to: AwxRoute.WorkflowApprovals },
          { label: workflow_approval?.name },
        ]}
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Workflow Approvals'),
          page: AwxRoute.WorkflowApprovals,
          persistentFilterKey: 'workflow-approvals',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.WorkflowApprovalDetails },
          { label: t('Jobs'), page: AwxRoute.WorkflowApprovalWorkflowJobDetails },
        ]}
        params={{ id: params.id || 0 }}
      />
    </PageLayout>
  );
}
