/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import InventorySources from './InventorySources.jsx';
import JobTemplates from './JobTemplates';
import Projects from './Projects.jsx';
import SystemJobTemplates from './SystemJobTemplates.jsx';
import WorkflowApproval from './WorkflowApproval.jsx';
import WorkflowJobTemplateNodes from './WorkflowJobTemplateNodes.jsx';
import WorkflowJobTemplates from './WorkflowJobTemplates.jsx';
const WorkflowJobTemplatesAPI = new WorkflowJobTemplates();
const WorkflowApprovalAPI = new WorkflowApproval();
const WorkflowJobTemplateNodesAPI = new WorkflowJobTemplateNodes();
const JobTemplatesAPI = new JobTemplates();
const ProjectsAPI = new Projects();
const InventorySourcesAPI = new InventorySources();
const SystemJobTemplatesAPI = new SystemJobTemplates();
export {
  InventorySourcesAPI,
  SystemJobTemplatesAPI,
  ProjectsAPI,
  JobTemplatesAPI,
  WorkflowApprovalAPI,
  WorkflowJobTemplateNodesAPI,
  WorkflowJobTemplatesAPI,
};
