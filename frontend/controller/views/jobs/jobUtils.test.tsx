import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { getJobsAPIUrl, getRelaunchEndpoint } from './jobUtils';

const mockJob: UnifiedJob = {
  id: 491,
  type: 'workflow_job',
  url: '/api/v2/workflow_jobs/491/',
  related: {
    created_by: '/api/v2/users/2/',
    modified_by: '/api/v2/users/2/',
    unified_job_template: '/api/v2/workflow_job_templates/63/',
    workflow_job_template: '/api/v2/workflow_job_templates/63/',
    notifications: '/api/v2/workflow_jobs/491/notifications/',
    workflow_nodes: '/api/v2/workflow_jobs/491/workflow_nodes/',
    labels: '/api/v2/workflow_jobs/491/labels/',
    activity_stream: '/api/v2/workflow_jobs/491/activity_stream/',
    relaunch: '/api/v2/workflow_jobs/491/relaunch/',
    cancel: '/api/v2/workflow_jobs/491/cancel/',
  },
  summary_fields: {
    inventory: {
      id: 1,
      name: 'Demo Inventory',
      description: '',
      has_active_failures: false,
      total_hosts: 1,
      hosts_with_active_failures: 0,
      total_groups: 0,
      has_inventory_sources: true,
      total_inventory_sources: 1,
      inventory_sources_with_failures: 1,
      organization_id: 1,
      kind: '',
    },
    workflow_job_template: { id: 63, name: 'Workflow 1214', description: '' },
    unified_job_template: {
      id: 63,
      name: 'Workflow 1214',
      description: '',
      unified_job_type: 'workflow_job',
    },
    created_by: { id: 2, username: 'vnambiar', first_name: '', last_name: '' },
    modified_by: { id: 2, username: 'vnambiar', first_name: '', last_name: '' },
    user_capabilities: { delete: true, start: true },
    labels: { count: 0, results: [] },
  },
  created: '2022-12-14T17:13:12.934884Z',
  modified: '2022-12-14T17:13:13.401795Z',
  name: 'Workflow 1214',
  description: '',
  unified_job_template: 63,
  launch_type: 'manual',
  status: 'failed',
  failed: true,
  started: '2022-12-14T17:13:13.385572Z',
  finished: '2022-12-14T17:13:21.660217Z',
  canceled_on: null,
  elapsed: 8.275,
  job_explanation: 'No error handling paths found, marking workflow as failed',
  launched_by: { id: 2, name: 'vnambiar', type: 'user', url: '/api/v2/users/2/' },
  work_unit_id: null,
  workflow_job_template: 63,
  extra_vars: '{}',
  allow_simultaneous: false,
  job_template: null,
  is_sliced_job: false,
  inventory: 1,
  limit: null,
  scm_branch: '',
  webhook_service: '',
  webhook_credential: null,
  webhook_guid: '',
  skip_tags: null,
  job_tags: null,
};

describe('jobUtils', () => {
  it('Returns correct endpoint based on job type', () => {
    const endpoint = getJobsAPIUrl('workflow_job');
    expect(endpoint).toEqual('/api/v2/workflow_jobs/');
  });

  it('Returns correct relaunch endpoint based on job type', () => {
    const endpoint = getRelaunchEndpoint(mockJob);
    expect(endpoint).toEqual('/api/v2/workflow_jobs/491/relaunch/');
  });
});
