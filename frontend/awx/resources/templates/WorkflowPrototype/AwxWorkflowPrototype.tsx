/* eslint-disable i18next/no-literal-string */

import { PageSection } from '@patternfly/react-core';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { ItemsResponse } from '../../../../common/crud/Data';
import { useGet } from '../../../../common/crud/useGet';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { WorkflowJobNodeList } from '../../../interfaces/generated-from-swagger/api';
import { Workflow, WorkflowNode } from './Workflow';

export function AwxWorkflow(props: { template: WorkflowJobTemplate }) {
  const { template } = props;
  const { data: workflowJobNodeList } = useGet<ItemsResponse<WorkflowJobNodeList>>(
    `/api/v2/workflow_job_templates/${template.id}/workflow_nodes/`
  );

  const workflowNodes = workflowJobNodeList?.results.map<WorkflowNode>((node) => ({
    id: node.id ?? 0,
    title: node.summary_fields?.unified_job_template.name ?? 'Unknown',
    subtitle: node.summary_fields?.unified_job_template.unified_job_type ?? '',
    targetSuccess: [...(node.success_nodes ?? []), ...(node.always_nodes ?? [])],
    targetFailure: [...(node.failure_nodes ?? []), ...(node.always_nodes ?? [])],
  }));

  if (!workflowNodes) return <LoadingPage />;

  for (const workflowNode of workflowNodes) {
    switch (workflowNode.subtitle) {
      case 'job':
        workflowNode.subtitle = 'Job template';
        break;
      case 'project_update':
        workflowNode.subtitle = 'Project';
        break;
      case 'workflow_approval':
        workflowNode.subtitle = 'Approval';
        break;
      case 'system_job':
        workflowNode.subtitle = 'System job';
        break;
    }
  }
  return (
    <PageSection variant="default">
      <Workflow workflowNodes={workflowNodes} />
    </PageSection>
  );
}
