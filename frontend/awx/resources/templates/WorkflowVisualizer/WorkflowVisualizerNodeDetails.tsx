import {
  TopologySideBar as PFTopologySideBar,
  action,
  useVisualizationController,
} from '@patternfly/react-topology';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { useTranslation } from 'react-i18next';
import { ActionList, Button, Title } from '@patternfly/react-core';
import styled from 'styled-components';
import { useGetDetailComponent } from './hooks/useGetDetailComponent';
import { useCallback } from 'react';
import { useViewOptions } from './ViewOptionsProvider';

const TopologySideBar = styled(PFTopologySideBar)`
  padding-top: 20px;
  padding-left: 20px;
`;
export function WorkflowVisualizerNodeDetails(props: { resource: WorkflowNode }) {
  const { resource: selectedNode } = props;
  const { t } = useTranslation();

  const getDetails = useGetDetailComponent(selectedNode);
  const controller = useVisualizationController();
  const { setSidebarMode } = useViewOptions();

  const handleClose = useCallback(() => {
    action(() => {
      controller.setState({ ...controller.getState(), selectedIds: [] });
      setSidebarMode(undefined);
    })();
  }, [controller, setSidebarMode]);

  return (
    <TopologySideBar
      data-cy="workflow-topology-sidebar"
      show
      header={<Title headingLevel="h1">{t('Node details')}</Title>}
      resizable
      onClose={handleClose}
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
