import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';

export const mockWorkflowApproval: WorkflowApproval = {
  id: 1,
  type: 'workflow_approval',
  name: 'Test Workflow Approval',
  description: 'Test approval description',
  unified_job_template: '1',
  launch_type: 'workflow',
  status: 'pending',
  failed: false,
  started: '2024-01-01T00:00:00Z',
  finished: '2024-01-01T00:00:00Z',
  canceled_on: undefined,
  elapsed: 0,
  job_explanation: '',
  can_approve_or_deny: 'true',
  approval_expiration: '2024-01-02T00:00:00Z',
  timed_out: false,
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  summary_fields: {
    workflow_job_template: {
      id: 1,
      name: 'Test Workflow Job Template',
      description: 'Test workflow template',
    },
    workflow_job: {
      id: 1,
      name: 'Test Workflow Job',
      description: 'Test workflow job',
    },
    workflow_approval_template: {
      id: 1,
      name: 'Test Workflow Approval Template',
      description: 'Test approval template',
      timeout: 0,
    },
    unified_job_template: {
      id: 1,
      name: 'Test Workflow Approval Template',
      description: 'Test approval template',
      unified_job_type: 'workflow_approval',
    },
    created_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
    user_capabilities: {
      delete: true,
      start: true,
    },
    source_workflow_job: {
      id: 1,
      name: 'Test Workflow Job',
      description: 'Test workflow job',
      status: 'running',
      failed: false,
      elapsed: 100,
    },
  },
};
