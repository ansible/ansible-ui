import { Node, observer, useVisualizationController } from '@patternfly/react-topology';
import { WorkflowVisualizerNodeDetails } from '../WorkflowVisualizerNodeDetails';

import { NodeForm } from '../NodeForm';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { GraphData } from '../types';

export const Sidebar = observer(() => {
  const controller = useVisualizationController();
  const state: { selectedIds: string[] } = controller.getState();
  const { selectedIds } = state;

  const graphData = controller?.getGraph()?.getData() as GraphData;

  if (graphData && graphData.sideBarMode === 'add') return <NodeForm node={undefined} />;

  if (!selectedIds?.length || Number.isNaN(parseInt(selectedIds[0], 10))) return null;

  const node = controller.getNodeById(selectedIds[0]) as Node;
  const { resource } = node.getData() as { resource: WorkflowNode };

  if (graphData?.sideBarMode === 'edit') {
    return <NodeForm node={resource} />;
  }

  return <WorkflowVisualizerNodeDetails resource={resource} />;
});
