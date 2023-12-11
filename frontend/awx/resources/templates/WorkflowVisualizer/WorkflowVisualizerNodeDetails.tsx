import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ActionList, Button, Title } from '@patternfly/react-core';
import {
  TopologySideBar as PFTopologySideBar,
  action,
  useVisualizationController,
} from '@patternfly/react-topology';
import { useGetDetailComponent } from './hooks';
import { useViewOptions } from './ViewOptionsProvider';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

const TopologySideBar = styled(PFTopologySideBar)`
  padding-top: 20px;
  padding-left: 20px;
`;
export function WorkflowVisualizerNodeDetails(props: { resource: WorkflowNode }) {
  const { resource: selectedNode } = props;
  const { t } = useTranslation();

  const getDetails = useGetDetailComponent(selectedNode);
  const controller = useVisualizationController();
  const { workflowTemplate } = controller.getState<{ workflowTemplate: WorkflowJobTemplate }>();
  const isReadOnly = !workflowTemplate?.summary_fields?.user_capabilities?.edit;

  const { setSidebarMode } = useViewOptions();

  const handleClose = useCallback(() => {
    action(() => {
      controller.setState({ ...controller.getState(), selectedIds: [] });
      setSidebarMode(undefined);
    })();
  }, [controller, setSidebarMode]);

  const handleRemove = () => {
    const element = controller.getNodeById(selectedNode.id.toString());
    if (!element) return;
    element.getTargetEdges().forEach((edge) => edge.remove());
    element.getSourceEdges().forEach((edge) => edge.remove());
    element.remove();
    handleClose();
  };

  return (
    <TopologySideBar
      data-cy="workflow-topology-sidebar"
      header={<Title headingLevel="h1">{t('Node details')}</Title>}
      onClose={handleClose}
      resizable
      show
    >
      {getDetails}
      {!isReadOnly && (
        <ActionList data-cy="workflow-topology-sidebar-actions" style={{ paddingBottom: '20px' }}>
          <Button data-cy="edit-node" variant="primary" onClick={() => {}}>
            {t('Edit')}
          </Button>
          <Button data-cy="remove-node" variant="danger" onClick={handleRemove}>
            {t('Remove')}
          </Button>
        </ActionList>
      )}
    </TopologySideBar>
  );
}
