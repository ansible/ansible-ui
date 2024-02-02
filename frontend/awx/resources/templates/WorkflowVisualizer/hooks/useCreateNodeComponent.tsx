import {
  CREATE_CONNECTOR_DROP_TYPE,
  Graph,
  GraphElementProps,
  GraphModel,
  Node,
  NodeModel,
  WithCreateConnectorProps,
  nodeDragSourceSpec,
  nodeDropTargetSpec,
  withContextMenu,
  withCreateConnector,
  withDndDrop,
  withDragNode,
  withSelection,
} from '@patternfly/react-topology';
import { FunctionComponent, useCallback } from 'react';
import { GraphNode, GraphNodeData } from '../types';
import { useCreateConnector } from './useCreateConnector';
import { CONNECTOR_SOURCE_DROP, CONNECTOR_TARGET_DROP } from '../constants';
import { CustomNode, NodeContextMenu } from '../components';

export function useCreateNodeComponent(): () => FunctionComponent<
  Omit<WithCreateConnectorProps & GraphElementProps, keyof WithCreateConnectorProps>
> {
  const createConnector = useCreateConnector();
  const nodeContextMenu = useCallback(
    (element: GraphNode) => [<NodeContextMenu key="nodeContext" element={element} />],
    []
  );

  return useCallback(
    () =>
      withCreateConnector(
        (
          source: Node<NodeModel, GraphNodeData>,
          target: Node<NodeModel, GraphNodeData> | Graph<GraphModel, GraphModel>
        ) => {
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
    [createConnector, nodeContextMenu]
  );
}
