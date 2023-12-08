import { Node, observer, useVisualizationController } from '@patternfly/react-topology';
import { WorkflowVisualizerNodeDetails } from '../WorkflowVisualizerNodeDetails';

import { NodeForm } from '../NodeForm';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { useViewOptions } from '../ViewOptionsProvider';

export const Sidebar = observer(() => {
  const controller = useVisualizationController();
  const { sidebarMode, setSidebarMode } = useViewOptions();
  const state: { selectedIds: string[] } = controller.getState();
  const { selectedIds } = state;
  if (sidebarMode === 'add') return <NodeForm node={undefined} />;

  if (!selectedIds?.length || Number.isNaN(parseInt(selectedIds[0], 10))) {
    setSidebarMode(undefined);
    return null;
  }

  const node = controller.getNodeById(selectedIds[0]) as Node;
  const { resource } = node.getData() as { resource: WorkflowNode };

  if (sidebarMode === 'edit') {
    return <NodeForm node={resource} />;
  }

  return <WorkflowVisualizerNodeDetails resource={resource} />;
});
