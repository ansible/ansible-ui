import { useCallback } from 'react';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { ProjectDetails } from '../../../projects/ProjectPage/ProjectDetails';
import { TemplateDetails } from '../../TemplatePage/TemplateDetails';
import { WorkflowJobTemplateDetails } from '../../WorkflowJobTemplatePage/WorkflowJobTemplateDetails';
import { InventorySourceDetails } from '../../../inventories/inventorySources/InventorySourceDetails';
import { SystemJobNodeDetails } from '../components/SystemJobNodeDetails';
import { WorkflowApprovalNodeDetails } from '../components/WorkflowApprovalNodeDetails';

export function useGetDetailComponent(selectedNode: WorkflowNode) {
  const detailsComponent = useCallback(() => {
    let component;
    switch (selectedNode?.summary_fields.unified_job_template.unified_job_type) {
      case 'project_update':
        component = (
          <ProjectDetails
            projectId={selectedNode?.summary_fields.unified_job_template.id.toString()}
          />
        );
        break;
      case 'job':
        component = (
          <TemplateDetails
            templateId={selectedNode?.summary_fields.unified_job_template.id.toString()}
          />
        );

        break;
      case 'workflow_job':
        component = (
          <WorkflowJobTemplateDetails
            templateId={selectedNode?.summary_fields.unified_job_template.id.toString()}
          />
        );

        break;
      case 'inventory_update':
        component = (
          <InventorySourceDetails
            inventorySourceId={selectedNode?.summary_fields.unified_job_template.id.toString()}
          />
        );
        break;
      case 'system_job':
        component = <SystemJobNodeDetails selectedNode={selectedNode} />;
        break;
      case 'workflow_approval':
        component = <WorkflowApprovalNodeDetails selectedNode={selectedNode} />;
        break;

      default:
        component = null;
    }
    return component;
  }, [selectedNode]);
  return detailsComponent();
}
