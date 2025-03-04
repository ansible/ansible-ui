import { Job } from '@ansible/awx-ui/interfaces/Job';
import { JobTemplate } from '@ansible/awx-ui/interfaces/JobTemplate';
import { Label } from '@ansible/awx-ui/interfaces/Label';
import { MockResponse } from '../router/MockResponse';
import { RouteOptions } from '../router/Router';
import { controllerRelations } from './controllerRelations';

export function processJobTemplate(jobTemplate: JobTemplate) {
  jobTemplate.type = 'job_template';
}

export function getJobTemplateLaunch(options: RouteOptions): MockResponse {
  const { params, mockData } = options;
  const jobTemplateId = Number(params.id);
  const jobTemplate: JobTemplate | undefined = mockData.api.controller.v2.job_templates.find(
    (jt) => jt.id === jobTemplateId
  ) as JobTemplate;
  if (!jobTemplate) {
    return { status: 404, body: { error: 'Job template not found' } };
  }
  return {
    status: 200,
    body: {
      can_start_without_user_input: true,
      passwords_needed_to_start: [],
      ask_scm_branch_on_launch: false,
      ask_variables_on_launch: false,
      ask_tags_on_launch: false,
      ask_diff_mode_on_launch: false,
      ask_skip_tags_on_launch: false,
      ask_job_type_on_launch: false,
      ask_limit_on_launch: false,
      ask_verbosity_on_launch: false,
      ask_inventory_on_launch: false,
      ask_credential_on_launch: false,
      ask_execution_environment_on_launch: false,
      ask_labels_on_launch: false,
      ask_forks_on_launch: false,
      ask_job_slice_count_on_launch: false,
      ask_timeout_on_launch: false,
      ask_instance_groups_on_launch: false,
      survey_enabled: false,
      variables_needed_to_start: [],
      credential_needed_to_start: false,
      inventory_needed_to_start: false,
      job_template_data: jobTemplate,
      defaults: {
        inventory: {
          name: 'Demo Inventory',
          id: 1,
        },
        limit: '',
        scm_branch: '',
        labels: [
          {
            id: 22,
            name: 'Demo',
          },
        ],
        job_tags: '',
        skip_tags: '',
        extra_vars: '',
        diff_mode: false,
        job_type: 'run',
        verbosity: 0,
        credentials: [
          {
            id: 1,
            name: 'Demo Credential',
            credential_type: 1,
            passwords_needed: [],
          },
        ],
        execution_environment: {},
        forks: 0,
        job_slice_count: 1,
        timeout: 0,
        instance_groups: [],
        opa_query_path: 'testpkg/testrule',
      },
    },
  };
}

export function postJobTemplateLaunch(options: RouteOptions): MockResponse {
  const { params, mockData, requestData } = options;
  if (!requestData) {
    return { status: 400, body: { error: 'Missing request data' } };
  }
  const jobTemplateId = Number(params.id);
  const jobTemplate = mockData.api.controller.v2.job_templates.find(
    (jt) => jt.id === jobTemplateId
  );
  if (!jobTemplate) {
    return { status: 404, body: { error: 'Job template not found' } };
  }
  let jobId = 1;
  while (mockData.api.controller.v2.jobs.find((j) => j.id === jobId)) {
    jobId++;
  }

  const job: Partial<Job> = {
    id: jobId,
    type: 'job',
    // url: '/api/v2/jobs/1/',
    name: jobTemplate.name!,
    event_processing_finished: true,
    status: 'successful',
    job_template: jobTemplateId as unknown as string,
    // job_template_id: jobTemplateId,
    // job_template_name: 'Demo Job Template',
  };

  // Labels
  (job as { labels?: number[] }).labels = (
    jobTemplate as {
      labels?: number[];
    }
  ).labels;

  mockData.api.controller.v2.jobs.push(job);

  return {
    status: 201,
    body: controllerRelations(job, mockData),
  };
}

export function postJobTemplateLabels(options: RouteOptions): MockResponse {
  const { params, mockData, requestData } = options;

  if (!requestData) {
    return { status: 400, body: { error: 'Missing request data' } };
  }

  const jobTemplateId = Number(params.id);
  const jobTemplate = mockData.api.controller.v2.job_templates.find(
    (jt) => jt.id === jobTemplateId
  );
  if (!jobTemplate) {
    return { status: 404, body: { error: 'Job template not found' } };
  }

  const data = requestData as { name: string; organization: number };

  let labelId = 1;
  while (mockData.api.controller.v2.labels.find((l) => l.id === labelId)) {
    labelId++;
  }

  // This creates a fake relation between the job template and the label
  // which is then expeanded with the controllerRelations function
  const jobTemplateWithLabels = jobTemplate as { labels: number[] };
  if (!jobTemplateWithLabels.labels) {
    jobTemplateWithLabels.labels = [];
  }
  jobTemplateWithLabels.labels.push(labelId);

  const label: Partial<Label> = {
    id: labelId,
    name: data.name,
    organization: data.organization,
  };
  mockData.api.controller.v2.labels.push(label);
  return {
    status: 201,
    body: controllerRelations(label, mockData),
  };
}
