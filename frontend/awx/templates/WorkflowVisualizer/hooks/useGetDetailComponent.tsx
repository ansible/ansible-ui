import { useCallback } from 'react';
import { InventorySourceDetails } from '../../../infrastructure/inventories/inventorySources/InventorySourceDetails';
import { UnifiedJobType, WorkflowNode } from '../../../interfaces/WorkflowNode';
import { ProjectDetails } from '../../../projects/ProjectPage/ProjectDetails';
import { TemplateDetails } from '../../TemplatePage/TemplateDetails';
import { WorkflowJobTemplateDetails } from '../../WorkflowJobTemplatePage/WorkflowJobTemplateDetails';
import { SystemJobNodeDetails } from '../components/SystemJobNodeDetails';
import { WorkflowApprovalNodeDetails } from '../components/WorkflowApprovalNodeDetails';

export function useGetDetailComponent(selectedNode: WorkflowNode) {
  const detailsComponent = useCallback(() => {
    let component;
    switch (selectedNode?.summary_fields.unified_job_template.unified_job_type) {
      case UnifiedJobType.project_update:
        component = (
          <ProjectDetails
            projectId={selectedNode?.summary_fields.unified_job_template.id.toString()}
            disableScroll
          />
        );
        break;
      case UnifiedJobType.job:
        component = (
          <TemplateDetails
            templateId={selectedNode?.summary_fields.unified_job_template.id.toString()}
            disableScroll
          />
        );

        break;
      case UnifiedJobType.workflow_job:
        component = (
          <WorkflowJobTemplateDetails
            templateId={selectedNode?.summary_fields.unified_job_template.id.toString()}
            disableScroll
          />
        );

        break;
      case UnifiedJobType.inventory_update:
        component = (
          <InventorySourceDetails
            inventorySourceId={selectedNode?.summary_fields.unified_job_template.id.toString()}
            disableScroll
          />
        );
        break;
      case UnifiedJobType.system_job:
        component = <SystemJobNodeDetails selectedNode={selectedNode} disableScroll />;
        break;
      case UnifiedJobType.workflow_approval:
        component = <WorkflowApprovalNodeDetails selectedNode={selectedNode} disableScroll />;
        break;

      default:
        component = null;
    }
    return component;
  }, [selectedNode]);
  return detailsComponent();
}
