import { useCallback } from 'react';
import { EdgeModel } from '@patternfly/react-topology';
import { useCreateEdge } from './useCreateEdge';
import { EdgeStatus, GraphNode } from '../types';
import { START_NODE_ID } from '../constants';

export function useRemoveNode() {
  const createEdge = useCreateEdge();

  return useCallback(
    (element: GraphNode) => {
      const newEdges: EdgeModel[] = [];

      element.setVisible(false);
      const edgesToParents = element.getTargetEdges();
      const edgesToChildren = element.getSourceEdges();

      edgesToParents.forEach((parentEdge) => {
        parentEdge.setVisible(false);
      });

      // Create new edges from the removed node's parents to its children
      edgesToChildren.forEach((childEdge) => {
        childEdge.setVisible(false);

        edgesToParents.forEach((parentEdge) => {
          parentEdge.getSource().setState({ modified: true });

          const newParentId = parentEdge.getSource().getId();
          const newChildId = childEdge.getTarget().getId();
          const newEdgeId = `${newParentId}-${newChildId}`;
          let { tagStatus } = childEdge.getData() as { tagStatus: EdgeStatus };

          // If the new parent node is the start node,
          // set the edge status to info/always
          if (newParentId === START_NODE_ID) {
            tagStatus = EdgeStatus.info;
          }

          if (element.getController().getEdgeById(newEdgeId)) {
            // If the edge already exists, set it to visible
            element.getController().getEdgeById(newEdgeId)?.setVisible(true);
          } else {
            // If the edge does not exist, create a new edge
            const newEdge = createEdge(newParentId, newChildId, tagStatus);
            newEdges.push(newEdge);
          }
        });
      });

      const model = element.getController().toModel();
      if (!model.edges) {
        model.edges = [];
      }
      model.edges = [...model.edges, ...newEdges];

      element.getController().fromModel(model);
    },
    [createEdge]
  );
}
