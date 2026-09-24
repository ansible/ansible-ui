import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../../common/api/awx-utils';
import { RESOURCE_TYPE } from '../constants';
import { fetchLaunchConfigLoadResult } from './fetchLaunchConfigLoadResult';

const jobTemplateResource = { id: 5, name: 'Deploy', type: 'job_template' };
const workflowJobTemplateResource = { id: 8, name: 'Child WF', type: 'workflow_job_template' };

const server = setupServer(
  http.get(awxAPI`/job_templates//5`, () => HttpResponse.json(jobTemplateResource)),
  http.get(awxAPI`/job_templates/5/launch/`, () =>
    HttpResponse.json({
      ask_timeout_on_launch: true,
      survey_enabled: false,
      defaults: { timeout: 300 },
    })
  ),
  http.get(awxAPI`/job_templates//6`, () =>
    HttpResponse.json({ id: 6, name: 'No prompts', type: 'job_template' })
  ),
  http.get(awxAPI`/job_templates/6/launch/`, () =>
    HttpResponse.json({
      survey_enabled: false,
      defaults: {},
    })
  ),
  http.get(awxAPI`/workflow_job_templates//8`, () =>
    HttpResponse.json(workflowJobTemplateResource)
  ),
  http.get(awxAPI`/workflow_job_templates/8/launch/`, () =>
    HttpResponse.json({
      survey_enabled: true,
      defaults: {},
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchLaunchConfigLoadResult', () => {
  it('should return undefined when resourceId is missing', async () => {
    await expect(fetchLaunchConfigLoadResult(RESOURCE_TYPE.job, 0)).resolves.toBeUndefined();
  });

  it('should return undefined for node types that do not load launch config', async () => {
    await expect(
      fetchLaunchConfigLoadResult(RESOURCE_TYPE.workflow_approval, 1)
    ).resolves.toBeUndefined();
  });

  it('should load job template resource and launch config when prompts are enabled', async () => {
    await expect(fetchLaunchConfigLoadResult(RESOURCE_TYPE.job, 5)).resolves.toEqual({
      launch_config: {
        ask_timeout_on_launch: true,
        survey_enabled: false,
        defaults: { timeout: 300 },
      },
      resource: jobTemplateResource,
      resourceId: 5,
    });
  });

  it('should return null launch_config when the template has no prompt or survey steps', async () => {
    await expect(fetchLaunchConfigLoadResult(RESOURCE_TYPE.job, 6)).resolves.toEqual({
      launch_config: null,
      resource: { id: 6, name: 'No prompts', type: 'job_template' },
      resourceId: 6,
    });
  });

  it('should load workflow job template launch config from the workflow endpoint', async () => {
    await expect(fetchLaunchConfigLoadResult(RESOURCE_TYPE.workflow_job, 8)).resolves.toEqual({
      launch_config: {
        survey_enabled: true,
        defaults: {},
      },
      resource: workflowJobTemplateResource,
      resourceId: 8,
    });
  });
});
