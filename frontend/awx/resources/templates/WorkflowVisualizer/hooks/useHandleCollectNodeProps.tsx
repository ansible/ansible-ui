import {
  DropTargetMonitor,
  GraphElementProps,
  Node,
  NodeModel,
  NodeShape,
  NodeStatus,
  action,
} from '@patternfly/react-topology';
import { useCallback } from 'react';
import { useTargetNodeAncestors } from './useTargetNodeAncestors';
import { GraphNodeData } from '../types';

export function useHandleCollectNodeProps() {
  const targetNodeAncestors = useTargetNodeAncestors();
  return useCallback(
    (monitor: DropTargetMonitor, props: GraphElementProps) => {
      const isDragging = monitor.isDragging();

      const target = monitor.getDropResult() as Node;
      const nodeStatus = target?.getNodeStatus() || NodeStatus.default;

      const sourceNode = monitor.getItem() as Node;

      if (!isDragging) {
        const iteratedNode = props.element as Node<NodeModel, GraphNodeData>;
        action(() => {
          iteratedNode.setNodeShape(NodeShape.circle);
          iteratedNode.setNodeStatus(NodeStatus.default);
        })();
      }
      if (isDragging) {
        targetNodeAncestors(sourceNode);
      }
      return {
        ...props,
        canDrop: nodeStatus !== NodeStatus.danger,
        edgeDragging: isDragging,
      };
    },
    [targetNodeAncestors]
  );
}
