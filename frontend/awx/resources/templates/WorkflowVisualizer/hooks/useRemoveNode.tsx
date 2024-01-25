import { useCallback } from 'react';
import { EdgeModel } from '@patternfly/react-topology';
import { useCreateEdge } from './useCreateEdge';
import { EdgeStatus, GraphNode } from '../types';

export function useRemoveNode() {
  const createEdge = useCreateEdge();

  return useCallback(
    (element: GraphNode) => {
      const newEdges: EdgeModel[] = [];

      element.setVisible(false);
      element.getSourceEdges().forEach((sourceEdge) => {
        sourceEdge.setVisible(false);
        element.getTargetEdges().forEach((targetEdge) => {
          targetEdge.setVisible(false);
          const newSourceId = targetEdge.getSource().getId();
          const newTargetId = sourceEdge.getTarget().getId();
          const { tagStatus } = sourceEdge.getData() as { tagStatus: EdgeStatus };
          const newEdge = createEdge(newSourceId, newTargetId, tagStatus);

          newEdges.push(newEdge);
          targetEdge.getSource().setState({ modified: true });
        });
      });

      const model = element.getController().toModel();
      if (!model.edges) {
        model.edges = [];
      }
      model.edges.push(...newEdges);
      element.getController().fromModel(model);
    },
    [createEdge]
  );
}
