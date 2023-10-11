import { TopologyView as PFTopologyView } from '@patternfly/react-topology';
import { useWorkflowVisualizerToolbarActions } from '../hooks/useWorkflowVisualizerToolbarActions';
import { useState } from 'react';
import { ExitWarningModal } from './ExitWarningModal';
import styled from 'styled-components';

const TopologyView = styled(PFTopologyView)`
  & .pf-topology-view__project-toolbar {
    flex: 1;
  }
`;

export function WorkflowJobTemplateVisualizer() {
  const toggleSidePanel = useState(false);
  const [visualizerHasUnsavedChanges, _setVisualizerHasUnsavedChanges] = useState(false);
  const [isExitWarningModalOpen, setToggleExitWarningModal] = useState(false);
  const toolbarActions = useWorkflowVisualizerToolbarActions(
    toggleSidePanel,
    setToggleExitWarningModal,
    visualizerHasUnsavedChanges,
    []
  );

  return (
    <TopologyView contextToolbar={toolbarActions}>
      {isExitWarningModalOpen && (
        <ExitWarningModal
          hasUnsavedChanges={visualizerHasUnsavedChanges}
          toggleModal={setToggleExitWarningModal}
        />
      )}
    </TopologyView>
  );
}
