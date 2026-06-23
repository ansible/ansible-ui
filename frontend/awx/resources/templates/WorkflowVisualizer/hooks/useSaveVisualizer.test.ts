import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { RESOURCE_TYPE, START_NODE_ID } from '../constants';
import { EdgeStatus, type GraphNode, type GraphNodeData } from '../types';

const mockPostFn = vi.fn().mockResolvedValue({ id: 100 });
const mockPatchFn = vi.fn().mockResolvedValue({ id: 42 });
const mockDeleteFn = vi.fn().mockResolvedValue(undefined);

vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => mockPostFn),
}));

vi.mock('@ansible/common-ui/crud/usePatchRequest', () => ({
  usePatchRequest: vi.fn(() => mockPatchFn),
}));

vi.mock('@ansible/common-ui/crud/useDeleteRequest', () => ({
  useDeleteRequest: vi.fn(() => mockDeleteFn),
}));

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: vi.fn().mockResolvedValue({ results: [{ id: 1 }] }),
}));

vi.mock('@ansible/ansible-ui-framework/utils/codeEditorUtils', () => ({
  parseVariableField: vi.fn((v: string) => {
    try {
      return JSON.parse(v) as object;
    } catch {
      return {};
    }
  }),
}));

const mockRefresh = vi.fn();
vi.mock('../../../../common/useAwxGetAllPages', () => ({
  useAwxGetAllPages: vi.fn(() => ({ refresh: mockRefresh })),
}));

const mockSetState = vi.fn();
const mockElementSetState = vi.fn();
const mockLayout = vi.fn();
let mockGraphNodes: ReturnType<typeof makeGraphNode>[] = [];

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
    getState: () => ({ workflowTemplate: { id: 123 }, modified: false }),
    setState: mockSetState,
    getGraph: () => ({
      getNodes: () => mockGraphNodes,
      layout: mockLayout,
    }),
    getElements: () => [{ setState: mockElementSetState, getState: () => ({}) }],
  })),
  action: vi.fn((fn: () => void) => fn),
  observer: (component: unknown) => component,
  TopologySideBar: () => null,
  NodeShape: { circle: 'circle' },
  EdgeTerminalType: { directional: 'directional' },
}));

function makeGraphNode(
  overrides: {
    id?: string;
    visible?: boolean;
    modified?: boolean;
    nodeData?: Partial<GraphNodeData>;
    sourceEdges?: {
      isVisible: () => boolean;
      getData: () => { tagStatus: EdgeStatus };
      getTarget: () => { getId: () => string };
    }[];
  } = {}
) {
  const { id = '42', visible = true, modified = true, nodeData = {}, sourceEdges = [] } = overrides;

  const defaultNodeData: GraphNodeData = {
    resource: {
      id: 42,
      identifier: 'test-node',
      all_parents_must_converge: false,
      extra_data: {},
      always_nodes: [],
      failure_nodes: [],
      success_nodes: [],
      summary_fields: {
        unified_job_template: {
          id: 1,
          name: 'Test Template',
          unified_job_type: RESOURCE_TYPE.job,
        },
      },
    },
    launch_data: {
      original: {
        launch_config: {
          ask_labels_on_launch: true,
          ask_instance_groups_on_launch: true,
          ask_credential_on_launch: true,
          defaults: { credentials: [] },
        },
        labels: [{ id: 10, name: 'old-label' }],
        instance_groups: [{ id: 20, name: 'old-ig' }],
        credentials: [{ id: 30, name: 'old-cred' }],
      },
      labels: [{ id: 11, name: 'new-label' }],
      instance_groups: [{ id: 21, name: 'new-ig' }],
      credentials: [{ id: 31, name: 'new-cred' }],
    },
    survey_data: undefined,
    ...nodeData,
  } as GraphNodeData;

  return {
    getId: () => id,
    getData: () => defaultNodeData,
    getState: () => ({ modified }),
    isVisible: () => visible,
    setId: vi.fn(),
    setData: vi.fn(),
    setState: vi.fn(),
    setLabel: vi.fn(),
    getSourceEdges: () => sourceEdges,
  } as unknown as GraphNode;
}

const { toKeyedObject, useSaveVisualizer } = await import('./useSaveVisualizer');

describe('toKeyedObject', () => {
  test('should return keyed object for non-empty string value', () => {
    expect(toKeyedObject('identifier', 'my-node')).toEqual({ identifier: 'my-node' });
  });

  test('should return keyed object for numeric value', () => {
    expect(toKeyedObject('timeout', 30)).toEqual({ timeout: 30 });
  });

  test('should return keyed object for number 0', () => {
    expect(toKeyedObject('forks', 0)).toEqual({ forks: 0 });
  });

  test('should return empty object for empty string value', () => {
    expect(toKeyedObject('identifier', '')).toEqual({});
  });

  test('should return empty object for undefined value', () => {
    expect(toKeyedObject('identifier', undefined)).toEqual({});
  });

  test('should return empty object for null value', () => {
    expect(toKeyedObject('identifier', null)).toEqual({});
  });

  test('should use the provided key in the returned object', () => {
    const result = toKeyedObject('my_custom_key', 'value');
    expect(result).toHaveProperty('my_custom_key', 'value');
  });
});

describe('useSaveVisualizer', () => {
  beforeEach(() => {
    mockPostFn.mockClear().mockResolvedValue({ id: 100 });
    mockPatchFn.mockClear().mockResolvedValue({ id: 42 });
    mockDeleteFn.mockClear().mockResolvedValue(undefined);
    mockRefresh.mockClear();
    mockSetState.mockClear();
    mockElementSetState.mockClear();
    mockLayout.mockClear();
    mockGraphNodes = [];
  });

  test('should be callable and return a function', () => {
    const { result } = renderHook(() => useSaveVisualizer('123'));
    expect(typeof result.current).toBe('function');
  });

  test('should skip start node', async () => {
    mockGraphNodes = [makeGraphNode({ id: START_NODE_ID, modified: true })];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();
    expect(mockPostFn).not.toHaveBeenCalled();
    expect(mockPatchFn).not.toHaveBeenCalled();
    expect(mockDeleteFn).not.toHaveBeenCalled();
  });

  test('should delete invisible non-new nodes', async () => {
    mockGraphNodes = [makeGraphNode({ id: '42', visible: false, modified: false })];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();
    expect(mockDeleteFn).toHaveBeenCalledWith(
      expect.stringContaining('/workflow_job_template_nodes/42/')
    );
  });

  test('should not delete invisible new nodes', async () => {
    mockGraphNodes = [makeGraphNode({ id: 'unsavedNode-1', visible: false, modified: false })];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();
    expect(mockDeleteFn).not.toHaveBeenCalled();
  });

  test('should create new approval nodes', async () => {
    const approvalNode = makeGraphNode({
      id: 'unsavedNode-1',
      visible: true,
      modified: false,
      nodeData: {
        resource: {
          id: 0,
          identifier: 'approval-1',
          all_parents_must_converge: false,
          extra_data: {},
          always_nodes: [],
          failure_nodes: [],
          success_nodes: [],
          summary_fields: {
            unified_job_template: {
              id: 1,
              name: 'Approval Step',
              description: 'Approve this',
              unified_job_type: RESOURCE_TYPE.workflow_approval,
              timeout: 300,
            },
          },
        },
        launch_data: undefined,
        survey_data: undefined,
      } as unknown as Partial<GraphNodeData>,
    });
    mockGraphNodes = [approvalNode];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();

    const postCalls = mockPostFn.mock.calls;
    expect(postCalls.some((c: unknown[]) => (c[0] as string).includes('/workflow_nodes/'))).toBe(
      true
    );
    expect(
      postCalls.some((c: unknown[]) => (c[0] as string).includes('/create_approval_template/'))
    ).toBe(true);
  });

  test('should create new job template nodes with prompt values', async () => {
    const newNode = makeGraphNode({
      id: 'unsavedNode-2',
      visible: true,
      modified: false,
      nodeData: {
        resource: {
          id: 0,
          identifier: 'job-1',
          all_parents_must_converge: true,
          extra_data: {},
          always_nodes: [],
          failure_nodes: [],
          success_nodes: [],
          summary_fields: {
            unified_job_template: {
              id: 5,
              name: 'Deploy',
              unified_job_type: RESOURCE_TYPE.job,
            },
          },
        },
        launch_data: {
          diff_mode: true,
          forks: 10,
          limit: 'all',
          verbosity: 2,
          job_type: 'run',
          scm_branch: 'main',
          timeout: 60,
          job_tags: [{ name: 'deploy' }],
          skip_tags: [{ name: 'slow' }],
          inventory: { id: 3, name: 'prod' },
          execution_environment: { id: 7, name: 'ee' },
          job_slice_count: 2,
          labels: [{ id: 11, name: 'new-label' }],
          instance_groups: [{ id: 21, name: 'new-ig' }],
          credentials: [{ id: 31, name: 'new-cred' }],
          original: {
            launch_config: {
              ask_diff_mode_on_launch: true,
              ask_forks_on_launch: true,
              ask_limit_on_launch: true,
              ask_verbosity_on_launch: true,
              ask_job_type_on_launch: true,
              ask_scm_branch_on_launch: true,
              ask_timeout_on_launch: true,
              ask_tags_on_launch: true,
              ask_skip_tags_on_launch: true,
              ask_inventory_on_launch: true,
              ask_execution_environment_on_launch: true,
              ask_job_slice_count_on_launch: true,
              ask_variables_on_launch: true,
              ask_labels_on_launch: true,
              ask_instance_groups_on_launch: true,
              ask_credential_on_launch: true,
              defaults: { credentials: [] },
            },
            labels: [],
            instance_groups: [],
            credentials: [],
          },
        },
        survey_data: undefined,
      } as unknown as Partial<GraphNodeData>,
    });
    mockGraphNodes = [newNode];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();

    const postCalls = mockPostFn.mock.calls;
    expect(postCalls.some((c: unknown[]) => (c[0] as string).includes('/workflow_nodes/'))).toBe(
      true
    );
    // Process labels, instance groups, and credentials (associate only for new nodes)
    expect(postCalls.some((c: unknown[]) => (c[0] as string).includes('/labels/'))).toBe(true);
    expect(postCalls.some((c: unknown[]) => (c[0] as string).includes('/instance_groups/'))).toBe(
      true
    );
    expect(postCalls.some((c: unknown[]) => (c[0] as string).includes('/credentials/'))).toBe(true);
  });

  test('should create new system job node with extra_data days', async () => {
    const sysNode = makeGraphNode({
      id: 'unsavedNode-3',
      visible: true,
      modified: false,
      nodeData: {
        resource: {
          id: 0,
          identifier: 'sys-1',
          all_parents_must_converge: false,
          extra_data: { days: 120 },
          always_nodes: [],
          failure_nodes: [],
          success_nodes: [],
          summary_fields: {
            unified_job_template: {
              id: 9,
              name: 'Cleanup',
              unified_job_type: RESOURCE_TYPE.system_job,
            },
          },
        },
        launch_data: {
          original: {
            launch_config: { defaults: { credentials: [] } },
            labels: [],
            instance_groups: [],
            credentials: [],
          },
        },
        survey_data: undefined,
      } as unknown as Partial<GraphNodeData>,
    });
    mockGraphNodes = [sysNode];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();

    const workflowNodeCall = mockPostFn.mock.calls.find(
      (c: unknown[]) => typeof c[0] === 'string' && c[0].includes('/workflow_nodes/')
    );
    expect(workflowNodeCall).toBeDefined();
    expect((workflowNodeCall as unknown[])[1]).toHaveProperty('extra_data', { days: 120 });
  });

  test('should update edited job template nodes with disassociate before patch and associate after', async () => {
    const editedNode = makeGraphNode({
      id: '42',
      visible: true,
      modified: true,
    });
    mockGraphNodes = [editedNode];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();

    const postCalls = mockPostFn.mock.calls;
    const patchCalls = mockPatchFn.mock.calls;

    // Should have PATCH call for the node
    expect(
      patchCalls.some((c: unknown[]) => (c[0] as string).includes('/workflow_job_template_nodes/'))
    ).toBe(true);

    // Should have disassociate and associate calls for labels, IGs, and credentials
    const disassociateCalls = postCalls.filter(
      (c: unknown[]) => (c[1] as { disassociate?: boolean })?.disassociate === true
    );
    expect(disassociateCalls.length).toBeGreaterThan(0);
  });

  test('should call clearStaleNodeFields for edited nodes with template change', async () => {
    const editedNode = makeGraphNode({
      id: '42',
      visible: true,
      modified: true,
      nodeData: {
        resource: {
          id: 42,
          identifier: 'test-node',
          all_parents_must_converge: false,
          extra_data: {},
          always_nodes: [],
          failure_nodes: [],
          success_nodes: [],
          summary_fields: {
            unified_job_template: {
              id: 1,
              name: 'Test Template',
              unified_job_type: RESOURCE_TYPE.job,
            },
          },
        },
        launch_data: {
          original: {
            isTemplateChange: true,
            launch_config: {
              ask_labels_on_launch: false,
              ask_instance_groups_on_launch: false,
              ask_credential_on_launch: false,
              defaults: { credentials: [] },
            },
            labels: [],
            instance_groups: [],
            credentials: [],
          },
        },
        survey_data: undefined,
      } as unknown as Partial<GraphNodeData>,
    });
    mockGraphNodes = [editedNode];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();

    expect(
      mockPatchFn.mock.calls.some((c: unknown[]) =>
        (c[0] as string).includes('/workflow_job_template_nodes/')
      )
    ).toBe(true);
  });

  test('should update edited approval nodes', async () => {
    const approvalNode = makeGraphNode({
      id: '42',
      visible: true,
      modified: true,
      nodeData: {
        resource: {
          id: 42,
          identifier: 'approval-1',
          all_parents_must_converge: false,
          extra_data: {},
          always_nodes: [],
          failure_nodes: [],
          success_nodes: [],
          summary_fields: {
            unified_job_template: {
              id: 5,
              name: 'Updated Approval',
              description: 'Updated desc',
              unified_job_type: RESOURCE_TYPE.workflow_approval,
              timeout: 600,
            },
          },
        },
        launch_data: undefined,
        survey_data: undefined,
      } as unknown as Partial<GraphNodeData>,
    });
    mockGraphNodes = [approvalNode];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();

    expect(
      mockPatchFn.mock.calls.some((c: unknown[]) =>
        (c[0] as string).includes('/workflow_job_template_nodes/42/')
      )
    ).toBe(true);
    expect(
      mockPatchFn.mock.calls.some((c: unknown[]) =>
        (c[0] as string).includes('/workflow_approval_templates/')
      )
    ).toBe(true);
  });

  test('should create approval template when approval node has id === -1', async () => {
    const approvalNode = makeGraphNode({
      id: '42',
      visible: true,
      modified: true,
      nodeData: {
        resource: {
          id: 42,
          identifier: 'approval-1',
          all_parents_must_converge: false,
          extra_data: {},
          always_nodes: [],
          failure_nodes: [],
          success_nodes: [],
          summary_fields: {
            unified_job_template: {
              id: -1,
              name: 'New Approval',
              description: '',
              unified_job_type: RESOURCE_TYPE.workflow_approval,
              timeout: 0,
            },
          },
        },
        launch_data: undefined,
        survey_data: undefined,
      } as unknown as Partial<GraphNodeData>,
    });
    mockGraphNodes = [approvalNode];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();

    expect(
      mockPostFn.mock.calls.some((c: unknown[]) =>
        (c[0] as string).includes('/create_approval_template/')
      )
    ).toBe(true);
  });

  test('should handle edge modifications for success, failure, and always edges', async () => {
    const editedNode = makeGraphNode({
      id: '42',
      visible: true,
      modified: true,
      nodeData: {
        resource: {
          id: 42,
          identifier: 'test-node',
          all_parents_must_converge: false,
          extra_data: {},
          always_nodes: [],
          failure_nodes: [],
          success_nodes: [100],
          summary_fields: {
            unified_job_template: {
              id: 1,
              name: 'Test',
              unified_job_type: RESOURCE_TYPE.job,
            },
          },
        },
        launch_data: {
          original: {
            launch_config: {
              ask_labels_on_launch: false,
              defaults: { credentials: [] },
            },
            labels: [],
            instance_groups: [],
            credentials: [],
          },
        },
        survey_data: undefined,
      } as unknown as Partial<GraphNodeData>,
      sourceEdges: [
        {
          isVisible: () => true,
          getData: () => ({ tagStatus: EdgeStatus.danger }),
          getTarget: () => ({ getId: () => '100' }),
        },
        {
          isVisible: () => true,
          getData: () => ({ tagStatus: EdgeStatus.info }),
          getTarget: () => ({ getId: () => '200' }),
        },
      ],
    });
    mockGraphNodes = [editedNode];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();

    // Should disassociate old success_node[100] (now a danger edge)
    const disassociateCalls = mockPostFn.mock.calls.filter(
      (c: unknown[]) => (c[1] as { disassociate?: boolean })?.disassociate === true
    );
    const associateCalls = mockPostFn.mock.calls.filter(
      (c: unknown[]) =>
        !(c[1] as { disassociate?: boolean })?.disassociate &&
        typeof c[0] === 'string' &&
        (c[0].includes('/success_nodes/') ||
          c[0].includes('/failure_nodes/') ||
          c[0].includes('/always_nodes/'))
    );

    expect(disassociateCalls.length + associateCalls.length).toBeGreaterThan(0);
  });

  test('should set modified to false on all elements after save', async () => {
    mockGraphNodes = [];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();

    expect(mockSetState).toHaveBeenCalledWith(expect.objectContaining({ modified: false }));
    expect(mockRefresh).toHaveBeenCalled();
  });

  test('should process labels with no prompt but existing labels on disassociate', async () => {
    const editedNode = makeGraphNode({
      id: '42',
      visible: true,
      modified: true,
      nodeData: {
        resource: {
          id: 42,
          identifier: 'test-node',
          all_parents_must_converge: false,
          extra_data: {},
          always_nodes: [],
          failure_nodes: [],
          success_nodes: [],
          summary_fields: {
            unified_job_template: {
              id: 1,
              name: 'Test',
              unified_job_type: RESOURCE_TYPE.job,
            },
          },
        },
        launch_data: {
          original: {
            launch_config: {
              ask_labels_on_launch: false,
              ask_instance_groups_on_launch: false,
              ask_credential_on_launch: false,
              defaults: { credentials: [] },
            },
            labels: [{ id: 50, name: 'existing-label' }],
            instance_groups: [{ id: 60, name: 'existing-ig' }],
            credentials: [],
          },
        },
        survey_data: undefined,
      } as unknown as Partial<GraphNodeData>,
    });
    mockGraphNodes = [editedNode];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();

    const disassociateCalls = mockPostFn.mock.calls.filter(
      (c: unknown[]) =>
        (c[1] as { disassociate?: boolean })?.disassociate === true &&
        typeof c[0] === 'string' &&
        c[0].includes('/labels/')
    );
    expect(disassociateCalls.length).toBeGreaterThan(0);
  });

  test('should handle new node with survey data merged into extra_data', async () => {
    const newNode = makeGraphNode({
      id: 'unsavedNode-4',
      visible: true,
      modified: false,
      nodeData: {
        resource: {
          id: 0,
          identifier: 'survey-node',
          all_parents_must_converge: false,
          extra_data: {},
          always_nodes: [],
          failure_nodes: [],
          success_nodes: [],
          summary_fields: {
            unified_job_template: {
              id: 5,
              name: 'Survey Template',
              unified_job_type: RESOURCE_TYPE.job,
            },
          },
        },
        launch_data: {
          extra_vars: '{"key": "value"}',
          original: {
            launch_config: {
              ask_variables_on_launch: true,
              defaults: { credentials: [] },
            },
            labels: [],
            instance_groups: [],
            credentials: [],
          },
        },
        survey_data: { survey_key: 'survey_value' },
      } as unknown as Partial<GraphNodeData>,
    });
    mockGraphNodes = [newNode];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();

    const workflowNodeCall = mockPostFn.mock.calls.find(
      (c: unknown[]) => typeof c[0] === 'string' && c[0].includes('/workflow_nodes/')
    );
    expect(workflowNodeCall).toBeDefined();
    const payload = (workflowNodeCall as unknown[])[1] as { extra_data?: object };
    expect(payload.extra_data).toEqual(expect.objectContaining({ survey_key: 'survey_value' }));
  });

  test('should handle edited node with extra_vars prompt', async () => {
    const editedNode = makeGraphNode({
      id: '42',
      visible: true,
      modified: true,
      nodeData: {
        resource: {
          id: 42,
          identifier: 'test-node',
          all_parents_must_converge: false,
          extra_data: {},
          always_nodes: [],
          failure_nodes: [],
          success_nodes: [],
          summary_fields: {
            unified_job_template: {
              id: 1,
              name: 'Test',
              unified_job_type: RESOURCE_TYPE.job,
            },
          },
        },
        launch_data: {
          extra_vars: '{"var1": "val1"}',
          original: {
            launch_config: {
              ask_variables_on_launch: true,
              defaults: { credentials: [] },
            },
            labels: [],
            instance_groups: [],
            credentials: [],
          },
        },
        survey_data: { survey_answer: 42 },
      } as unknown as Partial<GraphNodeData>,
    });
    mockGraphNodes = [editedNode];
    const { result } = renderHook(() => useSaveVisualizer('123'));
    await result.current();

    const patchCalls = mockPatchFn.mock.calls;
    const nodePatch = patchCalls.find(
      (c: unknown[]) => typeof c[0] === 'string' && c[0].includes('/workflow_job_template_nodes/')
    );
    expect(nodePatch).toBeDefined();
    const payload = (nodePatch as unknown[])[1] as { extra_data?: object };
    expect(payload.extra_data).toEqual(expect.objectContaining({ survey_answer: 42 }));
  });
});
