import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RESOURCE_TYPE } from '../constants';
import { EdgeStatus } from '../types';
import { NodeAddWizard } from './NodeAddWizard';

const mockCloseSidebar = vi.fn();
const mockCreateEdge = vi.fn((source: string, target: string, status?: string) => ({
  id: `${source}-${target}`,
  type: 'edge',
  source,
  target,
  visible: true,
  data: { status },
}));
const mockFromModel = vi.fn();
const mockSetState = vi.fn();
const mockLayout = vi.fn();
const mockNodeSetState = vi.fn();
const mockSourceSetState = vi.fn();

let mockSourceNode: { getId: () => string; setState: typeof mockSourceSetState } | undefined;
let mockNodeTypeDefaults: () => Record<string, unknown>;

vi.mock('../../../../views/jobs/WorkflowOutput/WorkflowOutput', () => ({
  greyBadgeLabel: {
    badge: 'ALL',
    badgeColor: 'var(--pf-t--global--background--color--secondary--default)',
    badgeBorderColor: 'var(--pf-t--global--border--color--on-secondary)',
  },
}));

vi.mock('@patternfly/react-topology', () => ({
  useVisualizationController: vi.fn(() => ({
    getState: () => ({ sourceNode: mockSourceNode }),
    setState: mockSetState,
    getGraph: () => ({
      getNodes: () => [{ getId: () => 'startNode' }],
      layout: mockLayout,
    }),
    toModel: () => ({ nodes: [], edges: [] }),
    fromModel: mockFromModel,
    getNodeById: () => ({ setState: mockNodeSetState }),
  })),
  NodeModel: {},
  NodeShape: { circle: 'circle' },
  EdgeTerminalType: { directional: 'directional' },
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
  observer: (component: unknown) => component,
  TopologySideBar: () => null,
  TopologyView: () => null,
}));

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => ({ data: { actions: { POST: {} } } }),
}));

vi.mock('../hooks', () => ({
  useCloseSidebar: () => mockCloseSidebar,
  useCreateEdge: () => mockCreateEdge,
  useNodeTypeStepDefaults: () => mockNodeTypeDefaults,
}));

vi.mock('./NodeTypeStep', () => ({
  NodeTypeStep: () => <div data-testid="node-type-step">Node type step</div>,
}));

vi.mock('./NodePromptsStep', () => ({
  NodePromptsStep: () => <div data-testid="node-prompts-step">Prompts</div>,
}));

vi.mock('./NodeReviewStep', () => ({
  NodeReviewStep: () => <div data-testid="node-review-step">Review</div>,
}));

vi.mock('../../../../common/SurveyStep', () => ({
  SurveyStep: () => <div data-testid="survey-step">Survey</div>,
}));

const approvalDefaults = {
  approval_description: 'Approve this',
  approval_name: 'Approval Node',
  approval_timeout: 60,
  node_alias: '',
  node_convergence: 'any' as const,
  node_days_to_keep: 30,
  resource: null,
  resourceId: undefined,
  node_type: RESOURCE_TYPE.workflow_approval,
  node_status_type: EdgeStatus.info,
};

async function finishWizard() {
  const user = userEvent.setup();
  const nextButton = await screen.findByRole('button', { name: 'Next' }, { timeout: 5000 });
  await user.click(nextButton);

  const finishButton = await screen.findByRole('button', { name: 'Finish' }, { timeout: 5000 });
  await user.click(finishButton);
}

describe('NodeAddWizard submit', () => {
  beforeEach(() => {
    mockCloseSidebar.mockClear();
    mockCreateEdge.mockClear();
    mockFromModel.mockClear();
    mockSetState.mockClear();
    mockLayout.mockClear();
    mockNodeSetState.mockClear();
    mockSourceSetState.mockClear();
    mockSourceNode = undefined;
    mockNodeTypeDefaults = () => ({ ...approvalDefaults });
  });

  it('should render Add step wizard', async () => {
    render(
      <MemoryRouter>
        <NodeAddWizard />
      </MemoryRouter>
    );
    expect(await screen.findByTestId('wizard-title')).toHaveTextContent('Add step');
  });

  it('should create a root edge and node when there is no source node', async () => {
    render(
      <MemoryRouter>
        <NodeAddWizard />
      </MemoryRouter>
    );

    await finishWizard();

    await waitFor(() => {
      expect(mockFromModel).toHaveBeenCalled();
    });
    expect(mockCreateEdge).toHaveBeenCalledWith(
      'startNode',
      expect.stringContaining('-unsavedNode'),
      EdgeStatus.info
    );
    expect(mockCloseSidebar).toHaveBeenCalled();
    expect(mockLayout).toHaveBeenCalled();
    expect(mockNodeSetState).toHaveBeenCalledWith({ modified: true });
  });

  it('should attach grey badge when convergence is all', async () => {
    mockNodeTypeDefaults = () => ({
      ...approvalDefaults,
      node_convergence: 'all',
    });

    render(
      <MemoryRouter>
        <NodeAddWizard />
      </MemoryRouter>
    );

    await finishWizard();

    await waitFor(() => {
      expect(mockFromModel).toHaveBeenCalled();
    });
    const model = mockFromModel.mock.calls[0][0] as {
      nodes: Array<{ data: { badge?: string } }>;
    };
    expect(model.nodes[0].data.badge).toBe('ALL');
  });

  it('should keep identifier when alias is set and remove timeout for non-approval nodes', async () => {
    mockNodeTypeDefaults = () => ({
      ...approvalDefaults,
      node_type: RESOURCE_TYPE.job,
      node_alias: 'my-alias',
      resource: {
        id: 7,
        name: 'Demo Job',
        description: 'desc',
        type: 'job_template',
        project: 1,
        inventory: 1,
        organization: 3,
        ask_inventory_on_launch: false,
      },
      resourceId: 7,
      prompt: {
        credentials: [],
        labels: [],
        instance_groups: [],
      },
      launch_config: {
        ask_credential_on_launch: false,
        survey_enabled: false,
      },
      survey: { foo: 'bar' },
    });

    render(
      <MemoryRouter>
        <NodeAddWizard />
      </MemoryRouter>
    );

    await finishWizard();

    await waitFor(() => {
      expect(mockFromModel).toHaveBeenCalled();
    });
    const model = mockFromModel.mock.calls[0][0] as {
      nodes: Array<{
        label: string;
        data: {
          resource: {
            identifier?: string;
            extra_data?: unknown;
            summary_fields: {
              unified_job_template: { timeout?: number; name: string };
            };
          };
          launch_data: { organization?: number; original?: unknown };
          survey_data: { foo: string };
        };
      }>;
    };
    const node = model.nodes[0];
    expect(node.label).toBe('my-alias');
    expect(node.data.resource.identifier).toBe('my-alias');
    expect(node.data.resource.summary_fields.unified_job_template.timeout).toBeUndefined();
    expect(node.data.resource.extra_data).toBeUndefined();
    expect(node.data.launch_data.organization).toBe(3);
    expect(node.data.launch_data.original).toEqual({
      launch_config: {
        ask_credential_on_launch: false,
        survey_enabled: false,
      },
    });
    expect(node.data.survey_data).toEqual({ foo: 'bar' });
  });

  it('should keep extra_data days when resource has cleanup job type', async () => {
    mockNodeTypeDefaults = () => ({
      ...approvalDefaults,
      node_type: RESOURCE_TYPE.system_job,
      resource: {
        id: 9,
        name: 'Cleanup',
        description: '',
        type: 'system_job_template',
        job_type: 'cleanup_jobs',
      },
      resourceId: 9,
      node_days_to_keep: 14,
    });

    render(
      <MemoryRouter>
        <NodeAddWizard />
      </MemoryRouter>
    );

    await finishWizard();

    await waitFor(() => {
      expect(mockFromModel).toHaveBeenCalled();
    });
    const model = mockFromModel.mock.calls[0][0] as {
      nodes: Array<{ data: { resource: { extra_data?: { days: number } } } }>;
    };
    expect(model.nodes[0].data.resource.extra_data).toEqual({ days: 14 });
  });

  it('should create an edge from the source node using status type', async () => {
    mockSourceNode = {
      getId: () => 'source-1',
      setState: mockSourceSetState,
    };
    mockNodeTypeDefaults = () => ({
      ...approvalDefaults,
      node_status_type: EdgeStatus.success,
    });

    render(
      <MemoryRouter>
        <NodeAddWizard />
      </MemoryRouter>
    );

    await finishWizard();

    await waitFor(() => {
      expect(mockCreateEdge).toHaveBeenCalledWith(
        'source-1',
        expect.stringContaining('-unsavedNode'),
        EdgeStatus.success
      );
    });
    expect(mockSourceSetState).toHaveBeenCalledWith({ modified: true });
    // Root edge should not be created when source node exists
    expect(mockCreateEdge).not.toHaveBeenCalledWith(
      'startNode',
      expect.anything(),
      expect.anything()
    );
  });

  it('should map danger status when source node status is not info or success', async () => {
    mockSourceNode = {
      getId: () => 'source-2',
      setState: mockSourceSetState,
    };
    mockNodeTypeDefaults = () => ({
      ...approvalDefaults,
      node_status_type: EdgeStatus.danger,
    });

    render(
      <MemoryRouter>
        <NodeAddWizard />
      </MemoryRouter>
    );

    await finishWizard();

    await waitFor(() => {
      expect(mockCreateEdge).toHaveBeenCalledWith(
        'source-2',
        expect.stringContaining('-unsavedNode'),
        EdgeStatus.danger
      );
    });
  });

  it('should preserve approval timeout on approval nodes', async () => {
    render(
      <MemoryRouter>
        <NodeAddWizard />
      </MemoryRouter>
    );

    await finishWizard();

    await waitFor(() => {
      expect(mockFromModel).toHaveBeenCalled();
    });
    const model = mockFromModel.mock.calls[0][0] as {
      nodes: Array<{
        data: {
          resource: {
            identifier?: string;
            summary_fields: { unified_job_template: { timeout?: number; name: string } };
          };
        };
      }>;
    };
    expect(model.nodes[0].data.resource.summary_fields.unified_job_template.timeout).toBe(60);
    expect(model.nodes[0].data.resource.summary_fields.unified_job_template.name).toBe(
      'Approval Node'
    );
    expect(model.nodes[0].data.resource.identifier).toBeUndefined();
  });
});
