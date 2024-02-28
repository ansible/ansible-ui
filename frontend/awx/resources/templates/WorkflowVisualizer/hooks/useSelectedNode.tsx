import { useMemo } from 'react';
import { useVisualizationController, SELECTION_STATE } from '@patternfly/react-topology';
import { GraphNode } from '../types';

interface SelectionHandlerState {
  [SELECTION_STATE]?: string[];
}

export function useSelectedNode() {
  const controller = useVisualizationController();
  const { selectedIds } = controller.getState<SelectionHandlerState>();

  const node = useMemo<GraphNode | undefined>(() => {
    const selectedId = selectedIds && selectedIds[0];

    if (selectedId) {
      return controller.getNodeById(selectedId) as GraphNode;
    }
  }, [controller, selectedIds]);

  return node;
}
