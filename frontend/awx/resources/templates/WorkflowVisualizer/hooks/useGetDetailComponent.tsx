import { useCallback } from 'react';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { InventorySourceDetails } from '../../../inventories/inventorySources/InventorySourceDetails';
import { ProjectDetails } from '../../../projects/ProjectPage/ProjectDetails';
import { TemplateDetails } from '../../TemplatePage/TemplateDetails';
import { WorkflowJobTemplateDetails } from '../../WorkflowJobTemplatePage/WorkflowJobTemplateDetails';
import { SystemJobNodeDetails } from '../components/SystemJobNodeDetails';
import { WorkflowApprovalNodeDetails } from '../components/WorkflowApprovalNodeDetails';
import { RESOURCE_TYPE } from '../constants';

export function useGetDetailComponent(selectedNode: WorkflowNode | undefined) {
  const detailsComponent = useCallback(() => {
    if (!selectedNode) {
      return null;
    }
    let component;
    switch (selectedNode?.summary_fields?.unified_job_template?.unified_job_type) {
      case RESOURCE_TYPE.project_update:
        component = (
          <ProjectDetails
            projectId={selectedNode?.summary_fields.unified_job_template.id.toString()}
            disableScroll
          />
        );
        break;
      case RESOURCE_TYPE.job:
        component = (
          <TemplateDetails
            templateId={selectedNode?.summary_fields.unified_job_template.id.toString()}
            disableScroll
          />
        );

        break;
      case RESOURCE_TYPE.workflow_job:
        component = (
          <WorkflowJobTemplateDetails
            templateId={selectedNode?.summary_fields.unified_job_template.id.toString()}
            disableScroll
          />
        );

        break;
      case RESOURCE_TYPE.inventory_update:
        component = (
          <InventorySourceDetails
            inventorySourceId={selectedNode?.summary_fields.unified_job_template.id.toString()}
            disableScroll
          />
        );
        break;
      case RESOURCE_TYPE.system_job:
        component = <SystemJobNodeDetails selectedNode={selectedNode} />;
        break;
      case RESOURCE_TYPE.workflow_approval:
        component = <WorkflowApprovalNodeDetails selectedNode={selectedNode} />;
        break;

      default:
        component = null;
    }
    return component;
  }, [selectedNode]);
  return detailsComponent();
}
