import { Graph, GraphModel, Node, NodeModel, isNode } from '@patternfly/react-topology';
import { EdgeStatus, GraphNodeData } from '../types';
import { useCallback } from 'react';
import { useCreateEdge } from './useCreateEdge';

export function useCreateConnector() {
  const createEdge = useCreateEdge();
  return useCallback(
    (
      source: Node<NodeModel, GraphNodeData>,
      target: Node<NodeModel, GraphNodeData> | Graph<GraphModel, GraphModel>
    ) => {
      const model = source.getController().toModel();
      const controller = source.getController();
      if (!isNode(target)) {
        return;
      }
      if (!model.edges) {
        model.edges = [];
      }
      const edge = createEdge(source.getId(), target.getId(), EdgeStatus.info);
      model.edges.push(edge);
      source.setState({ modified: true });
      controller.setState({ ...controller.getState(), modified: true });
      controller.fromModel(model, true);
      controller.getGraph().layout();
    },
    [createEdge]
  );
}
