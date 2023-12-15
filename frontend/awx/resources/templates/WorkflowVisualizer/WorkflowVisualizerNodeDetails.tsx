import { useTranslation } from 'react-i18next';
import { ActionList, Button } from '@patternfly/react-core';
import { useVisualizationController } from '@patternfly/react-topology';
import { useCloseSidebar, useGetDetailComponent } from './hooks';
import { useViewOptions } from './ViewOptionsProvider';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

export function WorkflowVisualizerNodeDetails(props: { resource: WorkflowNode }) {
  const { resource: selectedNode } = props;
  const { t } = useTranslation();

  const handleClose = useCloseSidebar();
  const getDetails = useGetDetailComponent(selectedNode);
  const controller = useVisualizationController();
  const { workflowTemplate } = controller.getState<{ workflowTemplate: WorkflowJobTemplate }>();
  const isReadOnly = !workflowTemplate?.summary_fields?.user_capabilities?.edit;

  const { setSidebarMode } = useViewOptions();

  const handleRemove = () => {
    const element = controller.getNodeById(selectedNode.id.toString());
    if (!element) return;
    element.getTargetEdges().forEach((edge) => edge.remove());
    element.getSourceEdges().forEach((edge) => edge.remove());
    element.remove();
    handleClose();
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  return (
    <>
      {getDetails}
      {!isReadOnly && (
        <ActionList data-cy="workflow-topology-sidebar-actions" style={{ paddingBottom: '20px' }}>
          <Button data-cy="edit-node" variant="primary" onClick={handleEdit}>
            {t('Edit')}
          </Button>
          <Button data-cy="remove-node" variant="danger" onClick={handleRemove}>
            {t('Remove')}
          </Button>
        </ActionList>
      )}
    </>
  );
}
