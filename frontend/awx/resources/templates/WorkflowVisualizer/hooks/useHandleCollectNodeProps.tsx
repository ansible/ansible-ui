import {
  DropTargetMonitor,
  GraphElementProps,
  Node,
  NodeModel,
  NodeShape,
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
      const isInvalidLinkTarget: boolean =
        target?.getState<{ isInvalidLinkTarget: boolean }>()?.isInvalidLinkTarget ?? false;

      const sourceNode = monitor.getItem() as Node;

      if (!isDragging) {
        const iteratedNode = props.element as Node<NodeModel, GraphNodeData>;
        iteratedNode.setState({ ...props.element.getState(), isInvalidLinkTarget: false });
        action(() => iteratedNode.setNodeShape(NodeShape.circle))();
      }
      if (isDragging) {
        targetNodeAncestors(sourceNode);
      }
      return {
        ...props,
        canDrop: isInvalidLinkTarget,
        edgeDragging: isDragging,
      };
    },
    [targetNodeAncestors]
  );
}
