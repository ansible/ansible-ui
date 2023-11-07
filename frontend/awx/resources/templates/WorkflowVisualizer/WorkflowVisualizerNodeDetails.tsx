import { TopologySideBar as PFTopologySideBar } from '@patternfly/react-topology';
import { WorkflowVisualizerNode } from './types';
import { useTranslation } from 'react-i18next';
import { ActionList, Button, Title } from '@patternfly/react-core';
import styled from 'styled-components';
import { useGetDetailComponent } from './hooks/useGetDetailComponent';

const TopologySideBar = styled(PFTopologySideBar)`
  padding-top: 20px;
  padding-left: 20px;
`;
export function WorkflowVisualizerNodeDetails(props: {
  selectedNode: WorkflowVisualizerNode;
  setSelectedNode: (node: WorkflowVisualizerNode | undefined) => void;
}) {
  const { selectedNode, setSelectedNode } = props;
  const { t } = useTranslation();

  const getDetails = useGetDetailComponent(selectedNode);

  return (
    <TopologySideBar
      show
      header={<Title headingLevel="h1">{t('Node details')}</Title>}
      resizable
      onClose={() => setSelectedNode(undefined)}
    >
      {getDetails}
      <ActionList style={{ paddingBottom: '20px' }}>
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
