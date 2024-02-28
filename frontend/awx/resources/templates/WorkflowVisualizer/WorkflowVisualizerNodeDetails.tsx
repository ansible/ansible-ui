import { useTranslation } from 'react-i18next';
import { ActionList, Button, PageSection } from '@patternfly/react-core';
import { useVisualizationController } from '@patternfly/react-topology';
import { Scrollable } from '../../../../../framework';
import { useCloseSidebar, useGetDetailComponent } from './hooks';
import { useViewOptions } from './ViewOptionsProvider';
import { SidebarHeader } from './components';

import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import type { ControllerState, GraphNode } from './types';

export function WorkflowVisualizerNodeDetails({ node }: { node: GraphNode }) {
  const { t } = useTranslation();
  const closeSidebar = useCloseSidebar();
  const { removeNodes } = useViewOptions();
  const { setSidebarMode } = useViewOptions();

  const nodeData = node.getData()?.resource as WorkflowNode;
  const getDetails = useGetDetailComponent(nodeData);

  const controller = useVisualizationController();
  const { RBAC } = controller.getState<ControllerState>();

  const handleEdit = () => setSidebarMode('edit');
  const handleRemove = () => {
    removeNodes([node]);
    closeSidebar();
  };

  return (
    <>
      <SidebarHeader title={t('Node details')} onClose={closeSidebar} />
      <Scrollable borderTop>{getDetails}</Scrollable>
      {RBAC?.edit && (
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
    </>
  );
}
