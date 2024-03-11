import {
  CREATE_CONNECTOR_DROP_TYPE,
  DropTargetSpec,
  EDGE_DRAG_TYPE,
  Graph,
  GraphElement,
  GraphElementProps,
  GraphModel,
  Node,
  NodeModel,
  NodeStatus,
  TargetType,
  WithCreateConnectorProps,
  isNode,
  nodeDragSourceSpec,
  withContextMenu,
  withCreateConnector,
  withDndDrop,
  withDragNode,
  withSelection,
} from '@patternfly/react-topology';
import { FunctionComponent, useCallback } from 'react';
import { GraphNode, GraphNodeData } from '../types';
import { useCreateConnector } from './useCreateConnector';
import { CONNECTOR_SOURCE_DROP, CONNECTOR_TARGET_DROP, START_NODE_ID } from '../constants';
import { CustomNode, NodeContextMenu } from '../components';
import { useHandleCollectNodeProps } from './useHandleCollectNodeProps';

export function useCreateNodeComponent(): () => FunctionComponent<
  Omit<WithCreateConnectorProps & GraphElementProps, keyof WithCreateConnectorProps>
> {
  const createConnector = useCreateConnector();
  const nodeContextMenu = useCallback(
    (element: GraphNode) => [<NodeContextMenu key="nodeContext" element={element} />],
    []
  );

  const handleCollectNodeProps = useHandleCollectNodeProps();

  const nodeDropTargetSpec = useCallback(
    (
      accept?: TargetType
    ): DropTargetSpec<
      GraphElement,
      GraphNodeData,
      { edgeDragging?: boolean },
      GraphElementProps
    > => ({
      accept: accept || [EDGE_DRAG_TYPE, CREATE_CONNECTOR_DROP_TYPE],
      collect: handleCollectNodeProps,
    }),
    [handleCollectNodeProps]
  );
  return useCallback(
    () =>
      withCreateConnector(
        (
          source: Node<NodeModel, GraphNodeData>,
          target: Node<NodeModel, GraphNodeData> | Graph<GraphModel, GraphModel>
        ) => {
          if (!isNode(target)) return;

          const nodeStatus = target.getNodeStatus();
          if (nodeStatus === NodeStatus.danger) {
            return;
          }

          // If the target node is a root node
          // Hide the edge from the start node to the target node
          if (target.getTargetEdges().length === 1) {
            const edge = target.getTargetEdges()[0];
            if (edge.getSource().getId() === START_NODE_ID) {
              edge.setVisible(false);
            }
          }

          createConnector(source, target);
        }
      )(
        withContextMenu(nodeContextMenu)(
          withDndDrop(
            nodeDropTargetSpec([
              CONNECTOR_SOURCE_DROP,
              CONNECTOR_TARGET_DROP,
              CREATE_CONNECTOR_DROP_TYPE,
            ])
          )(withDragNode(nodeDragSourceSpec('node', true, true))(withSelection()(CustomNode)))
        )
      ),
    [createConnector, nodeContextMenu, nodeDropTargetSpec]
  );
}
