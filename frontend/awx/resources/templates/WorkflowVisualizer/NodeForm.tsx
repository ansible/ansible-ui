import { useTranslation } from 'react-i18next';
import {
  TopologySideBar as PFTopologySideBar,
  action,
  useVisualizationController,
} from '@patternfly/react-topology';
import { NodeFormInputs } from './components/NodeFormInputs';
import { Title } from '@patternfly/react-core';
import styled from 'styled-components';
import { useCallback } from 'react';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';

const TopologySideBar = styled(PFTopologySideBar)`
  padding-top: 20px;
  padding-left: 20px;
  padding-bottom: 20px;
`;

export function NodeForm(props: { node: WorkflowNode | undefined }) {
  const { t } = useTranslation();
  const controller = useVisualizationController();
  const toggleNodeForm = useCallback(() => {
    action(() => {
      controller
        .getGraph()
        .setData({ ...controller?.getGraph()?.getData(), sideBarMode: undefined });
      controller.setState({ ...controller.getState(), selectedIds: [] });
    })();
  }, [controller]);

  return (
    <TopologySideBar
      show
      header={<Title headingLevel="h1">{t('Node form')}</Title>}
      resizable
      onClose={toggleNodeForm}
    >
      <NodeFormInputs node={props.node} setSelectedNode={toggleNodeForm} />
    </TopologySideBar>
  );
}
