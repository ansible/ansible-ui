import { useCallback } from 'react';
import { GraphElement, Controller, action } from '@patternfly/react-topology';

/*
  This function is designed to deduplicate stale nodes after fetching new nodes from the API.

  Explanation:
  The topology library expects node IDs to be immutable. It uses the old ID as a key in the
  list of `this.elements`. This poses an issue when trying to remove a node using the new ID. 
  Additionally, the library creates an additional node with the new ID since it doesn't find 
  an existing node with the new ID in the list of `this.elements`. This results in duplicate nodes. 

  To address this issue, we've implemented this workaround to clean up and deduplicate stale nodes.
*/

type IController = Controller & {
  elements: { [id: string]: GraphElement };
};
export function useDedupeOldNodes() {
  return useCallback((controller: IController) => {
    const staleNodeKeys = Object.keys(controller?.elements).filter((key) =>
      key.endsWith('-unsavedNode')
    );
    staleNodeKeys.forEach((key) => {
      const staleNode = controller.getElementById(key);
      if (staleNode) {
        action(() => {
          staleNode.setId(key);
          controller.removeElement(staleNode);
        })();
      }
    });
  }, []);
}
