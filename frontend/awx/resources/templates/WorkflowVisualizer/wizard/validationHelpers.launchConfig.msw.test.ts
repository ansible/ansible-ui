import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../../common/api/awx-utils';
import type { JobTemplate } from '../../../../interfaces/JobTemplate';
import { RESOURCE_TYPE } from '../constants';
import { getResourceURL } from './helpers';
import { awaitNodeLaunchConfigForWizard, validateNodeTypeStep } from './validationHelpers';

const jobTemplateResource = {
  id: 20,
  name: 'Deploy',
  type: 'job_template',
  project: 1,
  inventory: 1,
  ask_inventory_on_launch: false,
} as JobTemplate;

const workflowJobTemplateResource = {
  id: 21,
  name: 'Nested WF',
  type: 'workflow_job_template',
};

const server = setupServer(
  http.get(`${getResourceURL(RESOURCE_TYPE.job)}/${20}`, () =>
    HttpResponse.json(jobTemplateResource)
  ),
  http.get(awxAPI`/job_templates/20/launch/`, () =>
    HttpResponse.json({
      ask_inventory_on_launch: true,
      survey_enabled: false,
      defaults: {},
    })
  ),
  http.get(`${getResourceURL(RESOURCE_TYPE.workflow_job)}/${21}`, () =>
    HttpResponse.json(workflowJobTemplateResource)
  ),
  http.get(awxAPI`/workflow_job_templates/21/launch/`, () =>
    HttpResponse.json({
      survey_enabled: true,
      defaults: {},
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('validationHelpers launch config (MSW)', () => {
  const mockT = (key: string) => key;

  it('should load job template launch config through ensureLaunchConfigLoad', async () => {
    await expect(
      awaitNodeLaunchConfigForWizard({
        node_type: RESOURCE_TYPE.job,
        resourceId: 20,
      })
    ).resolves.toEqual({
      launch_config: {
        ask_inventory_on_launch: true,
        survey_enabled: false,
        defaults: {},
      },
      resource: jobTemplateResource,
      resourceId: 20,
    });
  });

  it('should load workflow job template launch config through ensureLaunchConfigLoad', async () => {
    await expect(
      awaitNodeLaunchConfigForWizard({
        node_type: RESOURCE_TYPE.workflow_job,
        resourceId: 21,
      })
    ).resolves.toEqual({
      launch_config: {
        survey_enabled: true,
        defaults: {},
      },
      resource: workflowJobTemplateResource,
      resourceId: 21,
    });
  });

  it('should return supplemental wizard data from validateNodeTypeStep when the load completes', async () => {
    await expect(
      validateNodeTypeStep(
        mockT,
        { node_type: RESOURCE_TYPE.job, resourceId: 20 },
        { launch_config: null, resourceId: 1 }
      )
    ).resolves.toEqual({
      launch_config: {
        ask_inventory_on_launch: true,
        survey_enabled: false,
        defaults: {},
      },
      resource: jobTemplateResource,
      resourceId: 20,
    });
  });
});
