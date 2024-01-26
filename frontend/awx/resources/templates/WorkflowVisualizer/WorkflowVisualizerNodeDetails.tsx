import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ActionList, Button, PageSection } from '@patternfly/react-core';
import {
  TopologySideBar as PFTopologySideBar,
  action,
  useVisualizationController,
} from '@patternfly/react-topology';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { Scrollable } from '../../../../../framework';
import { GraphNode } from './types';
import { useViewOptions } from './ViewOptionsProvider';
import { useGetDetailComponent } from './hooks';
import { SidebarHeader } from './components';

const TopologySideBar = styled(PFTopologySideBar)`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

export function WorkflowVisualizerNodeDetails(props: { resource: WorkflowNode }) {
  const { resource: selectedNode } = props;
  const { t } = useTranslation();
  const { removeNodes } = useViewOptions();

  const getDetails = useGetDetailComponent(selectedNode);
  const controller = useVisualizationController();
  const { workflowTemplate, selectedIds } = controller.getState<{
    workflowTemplate: WorkflowJobTemplate;
    selectedIds: string[];
  }>();
  const selectedNodeId = selectedIds[0];
  const isReadOnly = !workflowTemplate?.summary_fields?.user_capabilities?.edit;

  const { setSidebarMode } = useViewOptions();

  const handleClose = useCallback(() => {
    action(() => {
      controller.setState({ ...controller.getState(), selectedIds: [] });
      setSidebarMode(undefined);
    })();
  }, [controller, setSidebarMode]);

  const handleRemove = () => {
    const element: GraphNode | undefined = controller.getNodeById(selectedNodeId);
    if (!element) return;
    removeNodes([element]);
    handleClose();
  };

  const handleEdit = () => {
    setSidebarMode('edit');
    controller.setState({ ...controller.getState(), selectedIds: [selectedNodeId] });
  };

  return (
    <TopologySideBar data-cy="workflow-topology-sidebar" resizable show>
      <SidebarHeader title={t('Node details')} onClose={handleClose} />
      <Scrollable borderTop>{getDetails}</Scrollable>
      {!isReadOnly && (
        <PageSection variant="light" isFilled={false} className="bg-lighten border-top">
          <ActionList data-cy="workflow-topology-sidebar-actions">
            <Button data-cy="edit-node" variant="primary" onClick={handleEdit}>
              {t('Edit')}
            </Button>
            <Button data-cy="remove-node" variant="danger" onClick={handleRemove}>
              {t('Remove')}
            </Button>
          </ActionList>
        </PageSection>
      )}
    </TopologySideBar>
  );
}
