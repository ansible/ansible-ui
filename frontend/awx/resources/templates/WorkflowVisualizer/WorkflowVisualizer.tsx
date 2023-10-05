import { TopologyView } from '@patternfly/react-topology';
import { useWorkflowVisualizerToolbarActions } from '../hooks/useWorkflowVisualizerToolbarActions';
import { useState } from 'react';
import { UnsavedChangesAlertModal } from './UnsavedChangesAlertModal';

export function WorkflowJobTemplateVisualizer() {
  const toggleSidePanel = useState(false);
  const [visualizerHasUnsavedChanges, _setVisualizerHasUnsavedChanges] = useState(false);
  const [isUnsaveChangesModalOpen, setToggleUnsaveChangesModal] = useState(false);
  const toolbarActions = useWorkflowVisualizerToolbarActions(
    toggleSidePanel,
    setToggleUnsaveChangesModal,
    visualizerHasUnsavedChanges
  );

  return (
    <TopologyView contextToolbar={toolbarActions}>
      {isUnsaveChangesModalOpen && (
        <UnsavedChangesAlertModal
          modalState={[isUnsaveChangesModalOpen, setToggleUnsaveChangesModal]}
        />
      )}
    </TopologyView>
  );
}
