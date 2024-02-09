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
  TargetType,
  WithCreateConnectorProps,
  withContextMenu,
  withCreateConnector,
  withDndDrop,
  withSelection,
} from '@patternfly/react-topology';
import { FunctionComponent, useCallback } from 'react';
import { GraphNode, GraphNodeData } from '../types';
import { useCreateConnector } from './useCreateConnector';
import { CONNECTOR_SOURCE_DROP, CONNECTOR_TARGET_DROP } from '../constants';
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
          const targetState = target.getState<{ isInvalidLinkTarget: boolean }>();
          if (targetState.isInvalidLinkTarget) {
            return;
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
          )(withSelection()(CustomNode))
        )
      ),
    [createConnector, nodeContextMenu, nodeDropTargetSpec]
  );
}
