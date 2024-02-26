import { ActionList, Button, Title } from '@patternfly/react-core';
import { TopologySideBar as PFTopologySideBar } from '@patternfly/react-topology';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { WorkflowNode } from '../../interfaces/WorkflowNode';
import { useGetDetailComponent } from './hooks/useGetDetailComponent';

const TopologySideBar = styled(PFTopologySideBar)`
  padding-top: 20px;
  padding-left: 20px;
`;
export function WorkflowVisualizerNodeDetails(props: {
  selectedNode: WorkflowNode;
  setSelectedNode: (node: WorkflowNode | undefined) => void;
}) {
  const { selectedNode, setSelectedNode } = props;
  const { t } = useTranslation();

  const getDetails = useGetDetailComponent(selectedNode);

  return (
    <TopologySideBar
      data-cy="workflow-topology-sidebar"
      show
      header={<Title headingLevel="h1">{t('Node details')}</Title>}
      resizable
      onClose={() => setSelectedNode(undefined)}
    >
      {getDetails}
      <ActionList data-cy="workflow-topology-sidebar-actions" style={{ paddingBottom: '20px' }}>
        <Button variant="primary" onClick={() => {}}>
          {t('Edit')}
        </Button>
        <Button variant="danger" onClick={() => {}}>
          {t('Remove')}
        </Button>
      </ActionList>
    </TopologySideBar>
  );
}
