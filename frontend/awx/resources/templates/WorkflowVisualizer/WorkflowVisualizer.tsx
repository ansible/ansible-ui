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
import { useTranslation } from 'react-i18next';
import { EmptyStateNoData } from '../../../../../framework/components/EmptyStateNoData';
import { AddNodeButton } from './components/AddNodeButton';

const TopologyView = styled(PFTopologyView)`
  & .pf-topology-view__project-toolbar {
    flex: 1;
  }
`;

export function WorkflowVisualizer() {
  const { id } = useParams<{ id?: string }>();
  const { t } = useTranslation();

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | undefined>(undefined);
  const { data: wfNodes } = useGet<AwxItemsResponse<WorkflowNode>>(
    `/api/v2/workflow_job_templates/${Number(id).toString()}/workflow_nodes/`
  );

  const toolbarActions = useWorkflowVisualizerToolbarActions(wfNodes?.results ?? []); // The argument for this function will need to be the number of nodes.
  let topologyScreen;
  if (!wfNodes) {
    topologyScreen = <div>Loading...</div>;
  } else if (!wfNodes?.results?.length) {
    topologyScreen = (
      <EmptyStateNoData
        button={<AddNodeButton variant="primary" />}
        title={t('There are currently no nodes in this workflow')}
        description={t('Add a node by clicking the button below')}
      />
    );
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
