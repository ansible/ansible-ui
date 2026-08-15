import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../../common/api/awx-utils';
import { RESOURCE_TYPE } from '../constants';
import { EdgeStatus } from '../types';

// Mock requestGet to avoid happy-dom ReadableStream bug
vi.mock('@ansible/common-ui/crud/Data', async () => {
  const actual = await vi.importActual('@ansible/common-ui/crud/Data');
  return {
    ...actual,
    requestGet: vi.fn(),
  };
});

vi.mock('@patternfly/react-topology', () => ({
  Edge: {},
  EdgeModel: {},
  ElementModel: {},
  GraphElement: {},
  Node: {},
  NodeModel: {},
  NodeStatus: { danger: 'danger', success: 'success', info: 'info', default: 'default' },
  WithSelectionProps: {},
  useVisualizationController: vi.fn(() => ({
    getState: () => ({}),
    setState: () => {},
    getGraph: () => ({ getNodes: () => [], layout: () => {} }),
    getElements: () => [],
  })),
  action: vi.fn((fn: () => void) => fn),
  observer: (component: unknown) => component,
  TopologySideBar: () => null,
  NodeShape: { circle: 'circle' },
  EdgeTerminalType: { directional: 'directional' },
}));

const { requestGet } = await import('@ansible/common-ui/crud/Data');
const { getLaunchData, useGetInitialValues, useNodeTypeStepDefaults } = await import(
  './useGetInitialValues'
);

const server = setupServer(
  http.get(awxAPI`/job_templates/1/launch/`, () =>
    HttpResponse.json({
      ask_credential_on_launch: true,
      ask_inventory_on_launch: false,
      survey_enabled: false,
      defaults: {},
    })
  ),
  http.get(awxAPI`/job_templates/1/credentials/`, () =>
    HttpResponse.json({
      count: 1,
      results: [
        {
          id: 10,
          name: 'Template SSH',
          credential_type: 1,
          summary_fields: { credential_type: { name: 'Machine' } },
        },
      ],
    })
  ),
  http.get(awxAPI`/workflow_job_templates/2/launch/`, () =>
    HttpResponse.json({
      ask_inventory_on_launch: true,
      survey_enabled: false,
      defaults: {},
    })
  ),
  http.get(awxAPI`/workflow_job_template_nodes/42/credentials/`, () =>
    HttpResponse.json({
      count: 1,
      results: [
        {
          id: 20,
          name: 'Node SSH',
          credential_type: 1,
          summary_fields: { credential_type: { name: 'Machine' } },
        },
      ],
    })
  ),
  http.get(awxAPI`/workflow_job_template_nodes/42/labels/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'production' }] })
  ),
  http.get(awxAPI`/workflow_job_template_nodes/42/instance_groups/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 5, name: 'default' }] })
  )
);

// Mock data that requestGet will return (bypassing happy-dom fetch)
const mockData: Record<string, unknown> = {
  '/api/v2/job_templates/1/launch/': {
    ask_credential_on_launch: true,
    ask_inventory_on_launch: false,
    survey_enabled: false,
    defaults: {},
  },
  '/api/v2/job_templates/1/credentials/': {
    count: 1,
    results: [
      {
        id: 10,
        name: 'Template SSH',
        credential_type: 1,
        summary_fields: { credential_type: { name: 'Machine' } },
      },
    ],
  },
  '/api/v2/workflow_job_templates/2/launch/': {
    ask_inventory_on_launch: true,
    survey_enabled: false,
    defaults: {},
  },
  '/api/v2/workflow_job_template_nodes/42/credentials/': {
    count: 1,
    results: [
      {
        id: 20,
        name: 'Node SSH',
        credential_type: 1,
        summary_fields: { credential_type: { name: 'Machine' } },
      },
    ],
  },
  '/api/v2/workflow_job_template_nodes/42/labels/': {
    count: 1,
    results: [{ id: 1, name: 'production' }],
  },
  '/api/v2/workflow_job_template_nodes/42/instance_groups/': {
    count: 1,
    results: [{ id: 1, name: 'default' }],
  },
  '/api/v2/workflow_job_template_nodes/unsavedNode-1/credentials/': {
    count: 0,
    results: [],
  },
  '/api/v2/workflow_job_template_nodes/unsavedNode-1/labels/': { count: 0, results: [] },
  '/api/v2/workflow_job_template_nodes/unsavedNode-1/instance_groups/': {
    count: 0,
    results: [],
  },
  '/api/v2/workflow_job_template_nodes/unsavedNode-2/credentials/': {
    count: 0,
    results: [],
  },
  '/api/v2/workflow_job_template_nodes/unsavedNode-2/labels/': { count: 0, results: [] },
  '/api/v2/workflow_job_template_nodes/unsavedNode-2/instance_groups/': {
    count: 0,
    results: [],
  },
  '/api/v2/workflow_job_template_nodes/unsavedNode-3/credentials/': {
    count: 0,
    results: [],
  },
  '/api/v2/workflow_job_template_nodes/unsavedNode-3/labels/': { count: 0, results: [] },
  '/api/v2/workflow_job_template_nodes/unsavedNode-3/instance_groups/': {
    count: 0,
    results: [],
  },
  '/api/v2/job_templates/1/survey_spec/': {
    name: 'Survey',
    description: '',
    spec: [
      { variable: 'question1', question_name: 'Question 1', type: 'text' },
      { variable: 'question2', question_name: 'Question 2', type: 'integer' },
    ],
  },
};

// Test-specific overrides for server.use() - allows individual tests to override mockData
const testOverrides = new Map<string, unknown>();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
  // Mock requestGet to return data directly without going through fetch (avoids happy-dom ReadableStream bug)
  vi.mocked(requestGet).mockImplementation((url: string) => {
    // Check test-specific overrides first (for server.use() scenarios)
    if (testOverrides.has(url)) {
      return Promise.resolve(testOverrides.get(url));
    }
    // Then check static mock data
    const data = mockData[url];
    if (data) {
      return Promise.resolve(data);
    }
    return Promise.resolve({ count: 0, results: [] });
  });
});

beforeEach(() => {
  // Clear test-specific overrides before each test
  testOverrides.clear();
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeGraphNode(overrides: Record<string, unknown> = {}) {
  return {
    getData: () => ({
      resource: {
        identifier: 'my-alias',
        all_parents_must_converge: true,
        extra_data: { days: 14 },
        summary_fields: {
          unified_job_template: {
            id: 1,
            name: 'Demo Job Template',
            description: 'A description',
            unified_job_type: RESOURCE_TYPE.job,
            timeout: 120,
            ...overrides,
          },
        },
      },
    }),
  } as never;
}

describe('useNodeTypeStepDefaults', () => {
  it('should return default mapper values when node is undefined', () => {
    const { result } = renderHook(() => useNodeTypeStepDefaults());
    const defaults = result.current(undefined);

    expect(defaults.node_type).toBe(RESOURCE_TYPE.job);
    expect(defaults.node_convergence).toBe('any');
    expect(defaults.node_alias).toBe('');
    expect(defaults.approval_name).toBe('');
    expect(defaults.approval_description).toBe('');
    expect(defaults.approval_timeout).toBe(0);
    expect(defaults.node_days_to_keep).toBe(30);
    expect(defaults.resource).toBeNull();
    expect(defaults.resourceId).toBeUndefined();
    expect(defaults.node_status_type).toBe(EdgeStatus.info);
  });

  it('should return values from node data for a job template node', () => {
    const { result } = renderHook(() => useNodeTypeStepDefaults());
    const node = makeGraphNode();
    const defaults = result.current(node);

    expect(defaults.node_type).toBe(RESOURCE_TYPE.job);
    expect(defaults.node_convergence).toBe('all');
    expect(defaults.node_alias).toBe('my-alias');
    expect(defaults.node_days_to_keep).toBe(14);
    expect(defaults.resourceId).toBe(1);
    expect(defaults.approval_timeout).toBe(120);
  });

  it('should return approval name for workflow_approval node type', () => {
    const { result } = renderHook(() => useNodeTypeStepDefaults());
    const node = makeGraphNode({
      unified_job_type: RESOURCE_TYPE.workflow_approval,
      name: 'Approve Me',
    });
    const defaults = result.current(node);

    expect(defaults.approval_name).toBe('Approve Me');
    expect(defaults.node_type).toBe(RESOURCE_TYPE.workflow_approval);
  });

  it('should return empty approval_name for non-approval node types', () => {
    const { result } = renderHook(() => useNodeTypeStepDefaults());
    const node = makeGraphNode({ unified_job_type: RESOURCE_TYPE.job, name: 'My Template' });
    const defaults = result.current(node);

    expect(defaults.approval_name).toBe('');
  });

  it('should return empty approvalDescription when nodeType is falsy (no unified_job_template)', () => {
    const { result } = renderHook(() => useNodeTypeStepDefaults());
    const nodeNoUJT = {
      getData: () => ({
        resource: {
          identifier: 'my-node',
          all_parents_must_converge: false,
          extra_data: {},
          summary_fields: {},
        },
      }),
    } as never;

    const defaults = result.current(nodeNoUJT);
    expect(defaults.approval_description).toBe('');
    expect(defaults.approval_name).toBe('');
    expect(defaults.node_type).toBe(RESOURCE_TYPE.job);
    expect(defaults.resource).toBeNull();
    expect(defaults.resourceId).toBeUndefined();
  });

  it('should return empty alias when identifier is a UUID', () => {
    const { result } = renderHook(() => useNodeTypeStepDefaults());
    const uuidNode = {
      getData: () => ({
        resource: {
          identifier: '550e8400-e29b-41d4-a716-446655440000',
          all_parents_must_converge: null,
          extra_data: {},
          summary_fields: {
            unified_job_template: {
              id: 5,
              name: 'Template',
              unified_job_type: RESOURCE_TYPE.job,
              timeout: 0,
            },
          },
        },
      }),
    } as never;

    const defaults = result.current(uuidNode);
    expect(defaults.node_alias).toBe('');
    expect(defaults.node_convergence).toBe('any');
  });
});

describe('getLaunchData', () => {
  it('should return launch config for a job template node', async () => {
    const node = {
      getData: () => ({
        resource: {
          summary_fields: {
            unified_job_template: { unified_job_type: RESOURCE_TYPE.job, id: 1 },
          },
        },
      }),
    } as never;

    const result = await getLaunchData(node);
    expect(result?.ask_credential_on_launch).toBe(true);
    expect(result?.ask_inventory_on_launch).toBe(false);
  });

  it('should return launch config for a workflow job template node', async () => {
    const node = {
      getData: () => ({
        resource: {
          summary_fields: {
            unified_job_template: { unified_job_type: RESOURCE_TYPE.workflow_job, id: 2 },
          },
        },
      }),
    } as never;

    const result = await getLaunchData(node);
    expect(result?.ask_inventory_on_launch).toBe(true);
  });

  it('should return undefined when there is no unified_job_template', async () => {
    const node = {
      getData: () => ({
        resource: {
          summary_fields: {},
        },
      }),
    } as never;

    const result = await getLaunchData(node);
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-promptable node types like project_update', async () => {
    const node = {
      getData: () => ({
        resource: {
          summary_fields: {
            unified_job_template: { unified_job_type: RESOURCE_TYPE.project_update, id: 3 },
          },
        },
      }),
    } as never;

    const result = await getLaunchData(node);
    expect(result).toBeUndefined();
  });
});

describe('useGetInitialValues', () => {
  it('should return initial values for a new (unsaved) job template node', async () => {
    const newNode = {
      getId: () => 'unsavedNode-1',
      getData: () => ({
        launch_data: undefined,
        survey_data: undefined,
        resource: {
          identifier: '550e8400-e29b-41d4-a716-446655440000',
          all_parents_must_converge: false,
          extra_data: {},
          diff_mode: false,
          forks: 0,
          job_type: 'run',
          job_tags: '',
          skip_tags: '',
          timeout: 0,
          verbosity: 0,
          job_slice_count: 1,
          summary_fields: {
            unified_job_template: {
              id: 1,
              name: 'Demo Template',
              unified_job_type: RESOURCE_TYPE.job,
              timeout: 0,
            },
            inventory: null,
          },
        },
      }),
    } as never;

    const { result } = renderHook(() => useGetInitialValues());
    const initialValues = await result.current(newNode);

    expect(initialValues.nodeTypeStep).toBeDefined();
    expect(initialValues.nodeTypeStep.node_type).toBe(RESOURCE_TYPE.job);
    expect(initialValues.nodePromptsStep).toBeDefined();
    expect(initialValues.nodePromptsStep?.prompt?.credentials).toBeDefined();
  });

  it('should return initial values for a saved job template node fetching credentials and labels', async () => {
    const savedNode = {
      getId: () => '42',
      getData: () => ({
        launch_data: undefined,
        survey_data: undefined,
        resource: {
          identifier: 'my-node',
          all_parents_must_converge: true,
          extra_data: {},
          diff_mode: false,
          forks: 0,
          job_type: 'run',
          job_tags: '',
          skip_tags: '',
          timeout: 0,
          verbosity: 0,
          job_slice_count: 1,
          summary_fields: {
            unified_job_template: {
              id: 1,
              name: 'Demo Template',
              unified_job_type: RESOURCE_TYPE.job,
              timeout: 0,
            },
            inventory: { id: 1, name: 'My Inventory' },
          },
        },
      }),
    } as never;

    const { result } = renderHook(() => useGetInitialValues());
    const initialValues = await result.current(savedNode);

    expect(initialValues.nodeTypeStep.node_convergence).toBe('all');
    expect(initialValues.nodeTypeStep.node_alias).toBe('my-node');
    expect(initialValues.nodePromptsStep?.prompt?.original?.credentials).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Node SSH' })])
    );
    expect(initialValues.nodePromptsStep?.prompt?.original?.labels).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'production' })])
    );
    expect(initialValues.nodePromptsStep?.prompt?.original?.instance_groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'default' })])
    );
  });

  it('should use hidePromptStep path when launch config has no prompts', async () => {
    // Override launch config to have no prompts
    testOverrides.set('/api/v2/job_templates/1/launch/', {
      ask_credential_on_launch: false,
      ask_inventory_on_launch: false,
      ask_variables_on_launch: false,
      survey_enabled: false,
      defaults: {},
    });

    const newNode = {
      getId: () => 'unsavedNode-2',
      getData: () => ({
        launch_data: undefined,
        survey_data: undefined,
        resource: {
          identifier: '',
          all_parents_must_converge: false,
          extra_data: {},
          summary_fields: {
            unified_job_template: {
              id: 1,
              name: 'Simple Template',
              unified_job_type: RESOURCE_TYPE.job,
              timeout: 0,
            },
          },
        },
      }),
    } as never;

    const { result } = renderHook(() => useGetInitialValues());
    const initialValues = await result.current(newNode);

    expect(initialValues.nodePromptsStep?.prompt?.credentials).toEqual([]);
    expect(initialValues.nodePromptsStep?.prompt?.labels).toEqual([]);
    expect(initialValues.nodePromptsStep?.prompt?.instance_groups).toEqual([]);
  });

  it('should include prompt values when node has existing launch_data', async () => {
    const nodeWithPrompts = {
      getId: () => 'unsavedNode-3',
      getData: () => ({
        launch_data: {
          limit: 'webservers',
          credentials: [{ id: 30, name: 'Existing Cred', credential_type: 2 }],
        },
        survey_data: undefined,
        resource: {
          identifier: '',
          all_parents_must_converge: false,
          extra_data: {},
          summary_fields: {
            unified_job_template: {
              id: 1,
              name: 'Demo Template',
              unified_job_type: RESOURCE_TYPE.job,
              timeout: 0,
            },
          },
        },
      }),
    } as never;

    const { result } = renderHook(() => useGetInitialValues());
    const initialValues = await result.current(nodeWithPrompts);

    expect(initialValues.nodeTypeStep).toBeDefined();
    expect(initialValues.nodePromptsStep?.prompt?.limit).toBe('webservers');
  });

  it('should trigger survey path and return survey data when survey_enabled and ask_variables_on_launch are both true', async () => {
    // Override launch config to enable survey
    testOverrides.set('/api/v2/job_templates/1/launch/', {
      ask_credential_on_launch: false,
      ask_variables_on_launch: true,
      survey_enabled: true,
      defaults: {},
    });
    // Override survey spec
    testOverrides.set('/api/v2/job_templates/1/survey_spec/', {
      name: 'Test Survey',
      description: '',
      spec: [
        {
          variable: 'survey_var',
          type: 'text',
          question_name: 'Survey Var',
          question_description: '',
          required: false,
          default: '',
          min: 0,
          max: 1024,
          choices: [],
          new_question: false,
        },
      ],
    });

    const nodeWithSurveyData = {
      getId: () => 'unsavedNode-survey',
      getData: () => ({
        launch_data: undefined,
        survey_data: undefined,
        resource: {
          identifier: '',
          all_parents_must_converge: false,
          extra_data: { survey_var: 'existing_value', other_var: 'keep_this' },
          summary_fields: {
            unified_job_template: {
              id: 1,
              name: 'Survey Template',
              unified_job_type: RESOURCE_TYPE.job,
              timeout: 0,
            },
          },
        },
      }),
    } as never;

    const { result } = renderHook(() => useGetInitialValues());
    const initialValues = await result.current(nodeWithSurveyData);

    expect(initialValues.nodeTypeStep).toBeDefined();
    expect(initialValues.survey).toBeDefined();
  });

  it('should return empty array from getRelated when API returns no results', async () => {
    server.use(
      http.get(awxAPI`/workflow_job_template_nodes/99/credentials/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      ),
      http.get(awxAPI`/workflow_job_template_nodes/99/labels/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      ),
      http.get(awxAPI`/workflow_job_template_nodes/99/instance_groups/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      )
    );

    const savedNodeNoResults = {
      getId: () => '99',
      getData: () => ({
        launch_data: undefined,
        survey_data: undefined,
        resource: {
          identifier: 'my-node',
          all_parents_must_converge: false,
          extra_data: {},
          summary_fields: {
            unified_job_template: {
              id: 1,
              name: 'Demo Template',
              unified_job_type: RESOURCE_TYPE.job,
              timeout: 0,
            },
          },
        },
      }),
    } as never;

    const { result } = renderHook(() => useGetInitialValues());
    const initialValues = await result.current(savedNodeNoResults);

    expect(initialValues.nodePromptsStep?.prompt?.original?.credentials).toEqual([]);
    expect(initialValues.nodePromptsStep?.prompt?.original?.labels).toEqual([]);
    expect(initialValues.nodePromptsStep?.prompt?.original?.instance_groups).toEqual([]);
  });

  it('should handle project_update node type with no launch config (hidePromptStep = true)', async () => {
    const projectUpdateNode = {
      getId: () => 'unsavedNode-project',
      getData: () => ({
        launch_data: undefined,
        survey_data: undefined,
        resource: {
          identifier: '',
          all_parents_must_converge: false,
          extra_data: {},
          summary_fields: {
            unified_job_template: {
              id: 5,
              name: 'My Project',
              unified_job_type: RESOURCE_TYPE.project_update,
              timeout: 0,
            },
          },
        },
      }),
    } as never;

    const { result } = renderHook(() => useGetInitialValues());
    const initialValues = await result.current(projectUpdateNode);

    expect(initialValues.nodeTypeStep.node_type).toBe(RESOURCE_TYPE.project_update);
    expect(initialValues.nodePromptsStep?.prompt?.credentials).toEqual([]);
  });
});
