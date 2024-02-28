import { useCallback } from 'react';
import { useVisualizationController } from '@patternfly/react-topology';
import { useViewOptions } from '../ViewOptionsProvider';

export function useCloseSidebar() {
  const controller = useVisualizationController();
  const { setSidebarMode } = useViewOptions();

  return useCallback(() => {
    controller.setState({ ...controller.getState(), selectedIds: [], sourceNode: undefined });
    setSidebarMode(undefined);
  }, [controller, setSidebarMode]);
}
