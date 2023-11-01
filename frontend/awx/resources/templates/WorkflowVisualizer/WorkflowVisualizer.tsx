import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { TopologyView as PFTopologyView } from '@patternfly/react-topology';
import { Topology } from './Topology';
import { useGet } from '../../../../common/crud/useGet';
import { useWorkflowVisualizerToolbarActions } from './hooks/useWorkflowVisualizerToolbarActions';
import type { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { WorkflowVisualizerNodeDetails } from './WorkflowVisualizerNodeDetails';
import { useState } from 'react';

const TopologyView = styled(PFTopologyView)`
  & .pf-topology-view__project-toolbar {
    flex: 1;
  }
`;

export function WorkflowVisualizer() {
  const { id } = useParams<{ id?: string }>();
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | undefined>(undefined);
  const { data: wfNodes } = useGet<AwxItemsResponse<WorkflowNode>>(
    `/api/v2/workflow_job_templates/${Number(id).toString()}/workflow_nodes/`
  );

  const toolbarActions = useWorkflowVisualizerToolbarActions(wfNodes?.results ?? []); // The argument for this function will need to be the number of nodes.
  let topologyScreen;
  if (!wfNodes) {
    topologyScreen = <div>Loading...</div>;
  } else if (wfNodes?.results?.length === 0) {
    topologyScreen = <div>EMPTY</div>;
  } else {
    topologyScreen = (
      <Topology
        data={wfNodes}
        selectedNode={selectedNode}
        handleSelectedNode={(clickedNodeIdentifier: string[]) => {
          const clickedNodeData = wfNodes.results.find(
            (node) => node.id.toString() === clickedNodeIdentifier[0]
          );
          setSelectedNode(clickedNodeData);
        }}
      />
    );
  }

  return (
    <TopologyView
      sideBarOpen={selectedNode !== undefined}
      sideBarResizable
      sideBar={
        selectedNode ? (
          <WorkflowVisualizerNodeDetails
            setSelectedNode={setSelectedNode}
            selectedNode={selectedNode}
          />
        ) : null
      }
      contextToolbar={toolbarActions}
      data-cy="workflow-visualizer"
    >
      {topologyScreen}
    </TopologyView>
  );
}
