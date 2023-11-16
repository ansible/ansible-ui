import { useCallback } from 'react';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { ProjectDetails } from '../../../projects/ProjectPage/ProjectDetails';
import { TemplateDetails } from '../../TemplatePage/TemplateDetails';
import { WorkflowJobTemplateDetails } from '../../WorkflowJobTemplatePage/WorkflowJobTemplateDetails';
import { InventorySourceDetails } from '../../../inventories/inventorySources/InventorySourceDetails';
import { SystemJobNodeDetails } from '../components/SystemJobNodeDetails';
import { WorkflowApprovalNodeDetails } from '../components/WorkflowApprovalNodeDetails';

export function useGetDetailComponent(selectedNode: WorkflowNode[]) {
  const node = selectedNode[0];
  const detailsComponent = useCallback(() => {
    let component;
    switch (node.summary_fields.unified_job_template.unified_job_type) {
      case 'project_update':
        component = (
          <ProjectDetails projectId={node.summary_fields.unified_job_template.id.toString()} />
        );
        break;
      case 'job':
        component = (
          <TemplateDetails templateId={node.summary_fields.unified_job_template.id.toString()} />
        );

        break;
      case 'workflow_job':
        component = (
          <WorkflowJobTemplateDetails
            templateId={node.summary_fields.unified_job_template.id.toString()}
          />
        );

        break;
      case 'inventory_update':
        component = (
          <InventorySourceDetails
            inventorySourceId={node.summary_fields.unified_job_template.id.toString()}
          />
        );
        break;
      case 'system_job':
        component = <SystemJobNodeDetails selectedNode={node} />;
        break;
      case 'workflow_approval':
        component = <WorkflowApprovalNodeDetails selectedNode={node} />;
        break;

      default:
        component = null;
    }
    return component;
  }, [node]);
  return detailsComponent();
}
