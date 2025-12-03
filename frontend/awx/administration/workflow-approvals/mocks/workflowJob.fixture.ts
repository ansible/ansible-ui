import { WorkflowJob } from '../../../interfaces/WorkflowJob';

export const mockWorkflowJob: WorkflowJob = {
  id: 1,
  name: 'Test Workflow Job',
  description: 'Test workflow job',
  status: 'running',
  failed: false,
  elapsed: '100.000',
  summary_fields: {
    job: {
      id: 1,
      name: 'Default',
      description: '',
      status: 'running',
      failed: false,
      elapsed: 100,
      type: 'workflow_job',
    },
    workflow_job_template: {
      id: 1,
      name: 'Test Workflow Job Template',
      description: '',
    },
    unified_job_template: {
      id: 1,
      name: 'Test Workflow Job Template',
      description: '',
      unified_job_type: 'workflow_job',
    },
    created_by: {
      id: 1,
      username: 'admin',
      first_name: '',
      last_name: '',
    },
    modified_by: {
      id: 1,
      username: 'admin',
      first_name: '',
      last_name: '',
    },
    user_capabilities: {
      delete: true,
      start: true,
    },
    labels: {
      count: 0,
      results: [],
    },
  },
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  unified_job_template: '1',
  launched_by: {
    id: 1,
    name: 'admin',
    type: 'user',
    url: '/api/v2/users/1/',
  },
  extra_vars: '{}',
};
