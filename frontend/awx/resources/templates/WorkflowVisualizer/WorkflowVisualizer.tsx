import { TopologyView as PFTopologyView } from '@patternfly/react-topology';
import { useWorkflowVisualizerToolbarActions } from './Hooks/useWorkflowVisualizerToolbarActions';
import styled from 'styled-components';

const TopologyView = styled(PFTopologyView)`
  & .pf-topology-view__project-toolbar {
    flex: 1;
  }
`;

export function WorkflowVisualizer() {
  const toolbarActions = useWorkflowVisualizerToolbarActions();

  return <TopologyView contextToolbar={toolbarActions} />;
}
