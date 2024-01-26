import styled from 'styled-components';
import { TopologySideBar as PFTopologySideBar } from '@patternfly/react-topology';
import { useViewOptions } from '../ViewOptionsProvider';
import { WorkflowVisualizerNodeDetails } from '../WorkflowVisualizerNodeDetails';
import { NodeFormInputs } from './NodeFormInputs';
import { useSelectedNode } from '../hooks';

const TopologySideBar = styled(PFTopologySideBar)`
  display: flex;
  flex-direction: column;
`;

export function Sidebar() {
  const selectedNode = useSelectedNode();
  const { sidebarMode } = useViewOptions();

  if (!sidebarMode) return null;

  const nodeSidebar = {
    add: <NodeFormInputs node={undefined} />,
    edit: <NodeFormInputs node={selectedNode} />,
    view: selectedNode && <WorkflowVisualizerNodeDetails node={selectedNode} />,
  };

  return (
    <TopologySideBar data-cy="workflow-topology-sidebar" resizable show>
      {nodeSidebar[sidebarMode]}
    </TopologySideBar>
  );
}
