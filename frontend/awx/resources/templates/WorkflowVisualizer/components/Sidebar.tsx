import { Node, NodeModel, observer, useVisualizationController } from '@patternfly/react-topology';
import { WorkflowVisualizerNodeDetails } from '../WorkflowVisualizerNodeDetails';

import { NodeForm } from '../NodeForm';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { useViewOptions } from '../ViewOptionsProvider';

const GRAPH_ID = 'workflow-visualizer-graph';

export const Sidebar = observer(() => {
  const controller = useVisualizationController();

  const { sidebarMode, setSidebarMode } = useViewOptions();
  const { selectedIds = [] } = controller.getState<{ selectedIds: string[] }>();
  const selectedNodeIds = selectedIds.filter((id) => id !== GRAPH_ID);

  if (sidebarMode === 'add') return <NodeForm node={undefined} />;

  if (!selectedNodeIds?.length || Number.isNaN(parseInt(selectedNodeIds[0], 10))) {
    setSidebarMode(undefined);
    return null;
  }

  const node: Node<NodeModel, { resource: WorkflowNode }> | undefined = controller.getNodeById(
    selectedNodeIds[0]
  );
  const { resource } = node?.getData() as { resource: WorkflowNode };

  if (sidebarMode === 'edit') {
    return <NodeForm node={resource} />;
  }

  return <WorkflowVisualizerNodeDetails resource={resource} />;
});
