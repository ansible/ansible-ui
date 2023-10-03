import { TopologyView } from '@patternfly/react-topology';
import { useWorkflowVisualizerToolbarActions } from '../hooks/useWorkflowVisualizerToolbarActions';
import { useState } from 'react';

export function WorkflowJobTemplateVisualizer() {
  const [_isSidePanelFormOpen, setIsSidePanelFormOpen] = useState(false);
  const toolbarActions = useWorkflowVisualizerToolbarActions(setIsSidePanelFormOpen);

  return <TopologyView contextToolbar={toolbarActions}></TopologyView>;
}
