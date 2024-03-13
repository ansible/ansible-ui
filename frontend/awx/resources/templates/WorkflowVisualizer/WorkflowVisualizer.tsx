import { useParams } from 'react-router-dom';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { WorkflowTopology } from './WorkflowTopology';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { WorkflowVisualizerLoader } from './WorkflowVisualizerLoader';

export function WorkflowVisualizer() {
  const { id } = useParams<{ id: string }>();
  const {
    results: workflowNodes,
    error: workflowNodeError,
    isLoading: workflowNodeIsLoading,
    refresh: workflowNodeRefresh,
  } = useAwxGetAllPages<WorkflowNode>(awxAPI`/workflow_job_templates/${id ?? ''}/workflow_nodes/`);

  const {
    data: workflowJobTemplate,
    error: workflowError,
    refresh: workflowRefresh,
    isLoading: workflowIsLoading,
  } = useGetItem<WorkflowJobTemplate>(awxAPI`/workflow_job_templates/`, id);

  const error = workflowError || workflowNodeError;
  if (error) {
    return <AwxError error={error} handleRefresh={workflowRefresh || workflowNodeRefresh} />;
  }

  if (workflowIsLoading || workflowNodeIsLoading || !workflowJobTemplate || !workflowNodes) {
    return <WorkflowVisualizerLoader />;
  }

  return (
    <WorkflowTopology
      data={{
        workflowNodes,
        template: workflowJobTemplate,
      }}
    />
  );
}
