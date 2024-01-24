import { useCallback } from 'react';
import { TopologySideBar, action, useVisualizationController } from '@patternfly/react-topology';
import { useViewOptions } from './ViewOptionsProvider';
import { NodeFormInputs } from './components';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';

export function NodeForm(props: { node: WorkflowNode | undefined }) {
  const controller = useVisualizationController();
  const { setSidebarMode } = useViewOptions();
  const toggleNodeForm = useCallback(() => {
    action(() => {
      controller.setState({ ...controller.getState(), selectedIds: [] });
      setSidebarMode(undefined);
    })();
  }, [controller, setSidebarMode]);

  return (
    <TopologySideBar data-cy="node-form-dialog" show resizable>
      <NodeFormInputs node={props.node} setSelectedNode={toggleNodeForm} />
    </TopologySideBar>
  );
}
