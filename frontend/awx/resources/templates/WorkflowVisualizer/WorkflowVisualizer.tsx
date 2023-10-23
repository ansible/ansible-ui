import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { TopologyView as PFTopologyView } from '@patternfly/react-topology';
import { TopologyPipeline } from './TopologyPipeline';
import { useGet } from '../../../../common/crud/useGet';
import { useWorkflowVisualizerToolbarActions } from './hooks/useWorkflowVisualizerToolbarActions';
import type { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';

const TopologyView = styled(PFTopologyView)`
  & .pf-topology-view__project-toolbar {
    flex: 1;
  }
`;

export function WorkflowVisualizer() {
  const toolbarActions = useWorkflowVisualizerToolbarActions();

  const { id } = useParams<{ id?: string }>();
  const { data: wfNodes } = useGet<AwxItemsResponse<WorkflowNode>>(
    `/api/v2/workflow_job_templates/${Number(id).toString()}/workflow_nodes/`
  );

  let topologyScreen;
  if (!wfNodes) {
    topologyScreen = <div>Loading...</div>;
  } else if (wfNodes?.results?.length === 0) {
    topologyScreen = <div>EMPTY</div>;
  } else {
    topologyScreen = <TopologyPipeline data={wfNodes} />;
  }

  return (
    <TopologyView contextToolbar={toolbarActions} data-cy="workflow-visualizer">
      {topologyScreen}
    </TopologyView>
  );
}
