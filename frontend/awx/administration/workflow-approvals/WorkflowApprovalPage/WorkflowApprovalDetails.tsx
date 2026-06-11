import { PageDetails, PageDetailsFromColumns } from '@ansible/ansible-ui-framework';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { useWorkflowApprovalsColumns } from '../hooks/useWorkflowApprovalsColumns';

export function WorkflowApprovalDetails() {
  const params = useParams<{ id: string }>();
  const { data: workflowApproval } = useGetItem<WorkflowApproval>(
    awxAPI`/workflow_approvals`,
    params.id
  );
  const columns = useWorkflowApprovalsColumns();
  return workflowApproval ? (
    <PageDetails>
      <PageDetailsFromColumns item={workflowApproval} columns={columns} />
    </PageDetails>
  ) : null;
}
