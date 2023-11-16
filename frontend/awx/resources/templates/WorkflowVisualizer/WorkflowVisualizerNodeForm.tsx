import { useTranslation } from 'react-i18next';
import { TopologySideBar as PFTopologySideBar } from '@patternfly/react-topology';
import { NodeFormInputs } from './components/NodeFormInputs';
import { Title } from '@patternfly/react-core';
import styled from 'styled-components';
import { WorkflowVisualizerAction, WorkflowVisualizerState } from './types';
import { useCallback } from 'react';

const TopologySideBar = styled(PFTopologySideBar)`
  padding-top: 20px;
  padding-left: 20px;
`;

export function WorkflowVisualizerNodeForm(props: {
  dispatch: (action: WorkflowVisualizerAction) => void;
  state: WorkflowVisualizerState;
}) {
  const { t } = useTranslation();
  const {
    dispatch,
    state: { selectedNode },
  } = props;
  const handleClose = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_NODE', value: { node: [], mode: undefined } });
  }, [dispatch]);
  return (
    <TopologySideBar
      show
      header={<Title headingLevel="h1">{t('Node form')}</Title>}
      resizable
      onClose={handleClose}
    >
      <NodeFormInputs selectedNode={selectedNode[0]} setSelectedNode={handleClose} />
    </TopologySideBar>
  );
}
