import {
  ElementModel,
  GraphElement,
  NodeShape,
  NodeStatus,
  action,
} from '@patternfly/react-topology';
import { useCallback } from 'react';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';

export function useTargetNodeAncestors() {
  return useCallback((source: GraphElement<ElementModel, { resource: WorkflowNode }>) => {
    if (!source?.getGraph?.()) return;
    const nodes = source.getGraph().getNodes();
    const links = source.getGraph().getEdges();
    const newNodes = [...nodes];
    const parentMap: Record<string, { parents: string[]; traversed: boolean }> = {};
    const invalidLinkTargetIds: string[] = [];
    // Find and mark any ancestors as disabled to prevent cycles
    links.forEach((link) => {
      // id=1 is our artificial root node so we don't care about that
      if (link.getSource().getId() === 'startNode') {
        return;
      }
      if (link.getSource().getId() === source.getId()) {
        // Disables direct children from the add link process
        invalidLinkTargetIds.push(link.getTarget().getId());
      }
      if (!parentMap[link.getTarget().getId()]) {
        parentMap[link.getTarget().getId()] = {
          parents: [],
          traversed: false,
        };
      }
      parentMap[link.getTarget().getId()].parents.push(link.getSource().getId());
    });

    const getAncestors = (id: string) => {
      if (parentMap[id] && !parentMap[id].traversed) {
        parentMap[id].parents.forEach((parentId) => {
          invalidLinkTargetIds.push(parentId);
          getAncestors(parentId);
        });
        parentMap[id].traversed = true;
      }
    };

    getAncestors(source.getId());

    // Filter out the duplicates
    invalidLinkTargetIds
      .filter((element, index, array) => index === array.indexOf(element))
      .forEach((ancestorId) => {
        newNodes.forEach((node) => {
          if (node.getId() === ancestorId) {
            action(() => {
              node.setNodeShape(NodeShape.hexagon);
              node.setNodeStatus(NodeStatus.danger);
            })();
          }
        });
      });
  }, []);
}
