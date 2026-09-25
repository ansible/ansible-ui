import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { JobTemplate } from '../../../../interfaces/JobTemplate';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import { RESOURCE_TYPE } from '../constants';
import { EdgeStatus } from '../types';
import { NodeEditWizard } from './NodeEditWizard';
import * as fetchLaunchConfigLoadResultModule from './fetchLaunchConfigLoadResult';
import type { LaunchConfigLoadResult } from './launchConfigLoad';

vi.mock('./fetchLaunchConfigLoadResult', () => ({
  fetchLaunchConfigLoadResult: vi.fn(),
}));

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
    getState: () => ({ workflowTemplate: { id: 1 } }),
    setState: vi.fn(),
    getGraph: () => ({
      getNodes: () => [],
      layout: vi.fn(),
    }),
    getElements: () => [],
  })),
  action: vi.fn((fn: () => void) => fn),
  observer: (component: unknown) => component,
  TopologySideBar: () => null,
  NodeShape: { circle: 'circle' },
  EdgeTerminalType: { directional: 'directional' },
}));

vi.mock('../../../../views/jobs/WorkflowOutput/WorkflowOutput', () => ({
  greyBadgeLabel: {
    badge: 'ALL',
    badgeColor: 'var(--pf-t--global--background--color--secondary--default)',
    badgeBorderColor: 'var(--pf-t--global--border--color--on-secondary)',
  },
}));

const mockBuildEffectivePrompt = vi.fn(() => ({ effectivePrompt: { diff_mode: false } }));
vi.mock('./buildEffectivePrompt', () => ({
  buildEffectivePrompt: () => mockBuildEffectivePrompt(),
}));

const mockGetInitialValues = vi.fn(
  (): Promise<Record<string, unknown>> =>
    Promise.resolve({
      nodeTypeStep: {
        node_type: RESOURCE_TYPE.job,
        node_convergence: 'any' as const,
        node_alias: '',
        approval_name: '',
        approval_description: '',
        approval_timeout: 0,
        node_days_to_keep: 30,
        resource: null,
        resourceId: undefined,
        node_status_type: EdgeStatus.info,
      },
      nodePromptsStep: {
        prompt: {
          credentials: [],
          labels: [],
          instance_groups: [],
          original: {
            credentials: [],
            labels: [],
            instance_groups: [],
          },
        },
      },
    })
);

const mockWorkflowNodeOptions = { actions: { POST: {} } };

const mockUseOptions = vi.hoisted(() =>
  vi.fn(() => ({ data: mockWorkflowNodeOptions }))
);

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: mockUseOptions,
}));

const mockAddAlert = vi.fn();
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
  };
});

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

vi.mock('../hooks', () => ({
  useCloseSidebar: () => vi.fn(),
  useGetInitialValues: () => mockGetInitialValues,
  useNodeTypeStepDefaults: () => () => ({
    approval_description: '',
    approval_name: '',
    approval_timeout: 0,
    node_alias: '',
    node_convergence: 'any' as const,
    node_days_to_keep: 30,
    resource: null,
    resourceId: undefined,
    node_type: RESOURCE_TYPE.job,
    node_status_type: EdgeStatus.info,
  }),
  useGetTimeoutString: () => '0 min 0 sec',
  useCreateEdge: () => () => ({}),
  useDedupeOldNodes: () => vi.fn(),
  useGetNodeTypeDetail: () => vi.fn(),
  useRemoveGraphElements: () => vi.fn(),
  useRemoveNode: () => vi.fn(),
  useSaveVisualizer: () => vi.fn(),
  useSelectedNode: () => vi.fn(),
  useCreateConnector: () => vi.fn(),
  useHandleCollectNodeProps: () => vi.fn(),
  useGetPath: () => vi.fn(),
  useTargetNodeAncestors: () => vi.fn(),
}));

const mockSetLabel = vi.fn();
const mockSetData = vi.fn();
const mockSetState = vi.fn();

const mockNode = {
  getId: () => '42',
  getData: () => ({
    resource: {
      id: 42,
      identifier: '550e8400-e29b-41d4-a716-446655440000',
      all_parents_must_converge: false,
      extra_data: {},
      always_nodes: [],
      failure_nodes: [],
      success_nodes: [],
      summary_fields: {
        unified_job_template: {
          id: 1,
          name: 'Demo Template',
          unified_job_type: RESOURCE_TYPE.job,
        },
      },
    },
  }),
  setLabel: mockSetLabel,
  setData: mockSetData,
  setState: mockSetState,
  isVisible: () => true,
} as never;

describe('NodeEditWizard', () => {
  beforeEach(() => {
    mockUseOptions.mockClear();
    mockGetInitialValues.mockClear();
    mockSetLabel.mockClear();
    mockSetData.mockClear();
    mockSetState.mockClear();
    mockAddAlert.mockClear();
    vi.mocked(fetchLaunchConfigLoadResultModule.fetchLaunchConfigLoadResult).mockImplementation(
      (_nodeType, resourceId) =>
        Promise.resolve({
          launch_config: null,
          resource: {
            id: resourceId,
            name: 'Demo Template',
            description: '',
            type: 'job_template',
            project: 1,
            inventory: 1,
            ask_inventory_on_launch: false,
          } as JobTemplate,
          resourceId,
        } satisfies LaunchConfigLoadResult)
    );
  });

  it('should render null initially while loading initial values', () => {
    const { container } = render(
      <MemoryRouter>
        <NodeEditWizard node={mockNode} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render the wizard after initial values are fetched', async () => {
    render(
      <MemoryRouter>
        <NodeEditWizard node={mockNode} />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard-title')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    expect(screen.getByTestId('wizard-title')).toHaveTextContent('Edit step');
    expect(mockUseOptions).toHaveBeenCalled();
  });

  it('should call getInitialValues with the provided node', async () => {
    render(
      <MemoryRouter>
        <NodeEditWizard node={mockNode} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockGetInitialValues).toHaveBeenCalledWith(mockNode);
    });
  });

  it('should render null when getInitialValues rejects (error path)', async () => {
    mockGetInitialValues.mockRejectedValueOnce(new Error('API error'));

    const { container } = render(
      <MemoryRouter>
        <NodeEditWizard node={mockNode} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockGetInitialValues).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'danger',
          title: 'Failed to get default node values.',
        })
      );
    });
    expect(container.firstChild).toBeNull();
  });

  it('should show prompts step for job nodes with promptable launch config', async () => {
    const user = userEvent.setup();
    const launchConfigLoadResult: LaunchConfigLoadResult = {
      launch_config: {
        ask_credential_on_launch: true,
        survey_enabled: false,
      } as LaunchConfiguration,
      resource: {
        id: 1,
        name: 'Demo Template',
        description: '',
        type: 'job_template',
        project: 1,
        inventory: 1,
        ask_inventory_on_launch: false,
      } as JobTemplate,
      resourceId: 1,
    };
    vi.mocked(fetchLaunchConfigLoadResultModule.fetchLaunchConfigLoadResult).mockResolvedValueOnce(
      launchConfigLoadResult
    );
    mockGetInitialValues.mockResolvedValueOnce({
      nodeTypeStep: {
        node_type: RESOURCE_TYPE.job,
        node_convergence: 'any' as const,
        node_alias: '',
        approval_name: '',
        approval_description: '',
        approval_timeout: 0,
        node_days_to_keep: 30,
        resource: {
          id: 1,
          name: 'Demo Template',
          description: '',
          type: 'job_template',
          project: 1,
          inventory: 1,
          ask_inventory_on_launch: false,
        },
        resourceId: 1,
        node_status_type: EdgeStatus.info,
        launch_config: {
          ask_credential_on_launch: true,
          survey_enabled: false,
        },
      },
      nodePromptsStep: {
        prompt: {
          credentials: [],
          labels: [],
          instance_groups: [],
          requiredCredentialTypes: [{ id: 1, name: 'Machine' }],
          original: {
            credentials: [],
            labels: [],
            instance_groups: [],
          },
        },
      },
    });

    render(
      <MemoryRouter>
        <NodeEditWizard node={mockNode} />
      </MemoryRouter>
    );

    const nextButton = await screen.findByRole('button', { name: 'Next' }, { timeout: 5000 });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId('node-prompts-step')).toBeInTheDocument();
    });

    // Advancing prompts runs credential-type validation (required types from initial values)
    await user.click(screen.getByTestId('Submit'));
  });

  it('should hide prompts when launch_config exists but original prompt has none', async () => {
    const user = userEvent.setup();
    mockGetInitialValues.mockResolvedValueOnce({
      nodeTypeStep: {
        node_type: RESOURCE_TYPE.project_update,
        node_convergence: 'any' as const,
        node_alias: '',
        approval_name: '',
        approval_description: '',
        approval_timeout: 0,
        node_days_to_keep: 30,
        resource: { id: 5, name: 'Project', type: 'project' },
        resourceId: 5,
        node_status_type: EdgeStatus.info,
        launch_config: { ask_variables_on_launch: false },
      },
      nodePromptsStep: {
        prompt: {
          credentials: [],
          labels: [],
          instance_groups: [],
          original: {
            credentials: [],
            labels: [],
            instance_groups: [],
          },
        },
      },
    });

    render(
      <MemoryRouter>
        <NodeEditWizard node={mockNode} />
      </MemoryRouter>
    );

    const nextButton = await screen.findByRole('button', { name: 'Next' }, { timeout: 5000 });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
    });
    expect(screen.queryByTestId('node-prompts-step')).not.toBeInTheDocument();
  });

  it('should call buildEffectivePrompt and update node on submit', async () => {
    const user = userEvent.setup();
    mockGetInitialValues.mockResolvedValueOnce({
      nodeTypeStep: {
        node_type: RESOURCE_TYPE.workflow_approval,
        node_convergence: 'any' as const,
        node_alias: '',
        approval_name: 'Approval',
        approval_description: '',
        approval_timeout: 0,
        node_days_to_keep: 30,
        resource: null,
        resourceId: undefined,
        node_status_type: EdgeStatus.info,
      },
      nodePromptsStep: {
        prompt: {
          credentials: [],
          labels: [],
          instance_groups: [],
          original: {
            credentials: [],
            labels: [],
            instance_groups: [],
          },
        },
      },
    });

    render(
      <MemoryRouter>
        <NodeEditWizard node={mockNode} />
      </MemoryRouter>
    );

    // Wait for Next — title can appear before activeStep is set (useEffect), so Next
    // is not available on the first paint of the wizard shell.
    const nextButton = await screen.findByRole('button', { name: 'Next' }, { timeout: 5000 });
    // With workflow_approval and no launch_config, prompts and survey are hidden
    // Wizard goes: Node details → Review
    await user.click(nextButton);

    await waitFor(
      () => {
        const finishButton = screen.queryByRole('button', { name: 'Finish' });
        if (finishButton) {
          return expect(finishButton).toBeInTheDocument();
        }
        throw new Error('Finish button not found');
      },
      { timeout: 5000 }
    );

    const finishButton = screen.getByRole('button', { name: 'Finish' });
    await user.click(finishButton);

    await waitFor(
      () => {
        expect(mockBuildEffectivePrompt).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );

    expect(mockSetData).toHaveBeenCalled();
    expect(mockSetLabel).toHaveBeenCalled();
  });

  it('should show prompts step when initialValues has launch_config', async () => {
    mockGetInitialValues.mockResolvedValueOnce({
      nodeTypeStep: {
        node_type: RESOURCE_TYPE.job,
        node_convergence: 'any' as const,
        node_alias: '',
        approval_name: '',
        approval_description: '',
        approval_timeout: 0,
        node_days_to_keep: 30,
        resource: null,
        resourceId: undefined,
        node_status_type: EdgeStatus.info,
      },
      nodePromptsStep: {
        prompt: {
          launch_config: {
            ask_credential_on_launch: true,
          },
          credentials: [],
          labels: [],
          instance_groups: [],
          original: {
            credentials: [],
            labels: [],
            instance_groups: [],
          },
        } as never,
      },
    });

    render(
      <MemoryRouter>
        <NodeEditWizard node={mockNode} />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard-title')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    expect(screen.getByText('Edit step')).toBeInTheDocument();
  });

  it('should clear timeout for non-approval nodes and keep extra_data for cleanup jobs', async () => {
    const user = userEvent.setup();
    mockGetInitialValues.mockResolvedValueOnce({
      nodeTypeStep: {
        node_type: RESOURCE_TYPE.system_job,
        node_convergence: 'all' as const,
        node_alias: 'cleanup-alias',
        approval_name: '',
        approval_description: '',
        approval_timeout: 30,
        node_days_to_keep: 7,
        resource: {
          id: 9,
          name: 'Cleanup',
          description: '',
          type: 'system_job_template',
          job_type: 'cleanup_jobs',
        },
        resourceId: 9,
        node_status_type: EdgeStatus.info,
      },
      nodePromptsStep: {
        prompt: {
          credentials: [],
          labels: [],
          instance_groups: [],
          original: {
            credentials: [],
            labels: [],
            instance_groups: [],
          },
        },
      },
    });

    render(
      <MemoryRouter>
        <NodeEditWizard node={mockNode} />
      </MemoryRouter>
    );

    const nextButton = await screen.findByRole('button', { name: 'Next' }, { timeout: 5000 });
    await user.click(nextButton);

    const finishButton = await screen.findByRole('button', { name: 'Finish' }, { timeout: 5000 });
    await user.click(finishButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled();
    });

    const saved = mockSetData.mock.calls[0][0] as {
      resource: {
        extra_data?: { days?: number };
        summary_fields?: { unified_job_template?: { timeout?: number } };
      };
    };
    expect(saved.resource.summary_fields?.unified_job_template?.timeout).toBeUndefined();
    expect(saved.resource.extra_data).toEqual({ days: 7 });
    expect(mockSetLabel).toHaveBeenCalledWith('cleanup-alias');
  });

  it('should clear extra_data when resource does not keep days', async () => {
    const user = userEvent.setup();
    mockGetInitialValues.mockResolvedValueOnce({
      nodeTypeStep: {
        node_type: RESOURCE_TYPE.job,
        node_convergence: 'any' as const,
        node_alias: '',
        approval_name: '',
        approval_description: '',
        approval_timeout: 0,
        node_days_to_keep: 30,
        resource: {
          id: 1,
          name: 'Demo Template',
          description: '',
          type: 'job_template',
          project: 1,
          inventory: 1,
          ask_inventory_on_launch: false,
        },
        resourceId: 1,
        node_status_type: EdgeStatus.info,
        launch_config: null,
      },
      nodePromptsStep: {
        prompt: {
          credentials: [],
          labels: [],
          instance_groups: [],
          original: {
            credentials: [],
            labels: [],
            instance_groups: [],
          },
        },
      },
    });

    render(
      <MemoryRouter>
        <NodeEditWizard node={mockNode} />
      </MemoryRouter>
    );

    const nextButton = await screen.findByRole('button', { name: 'Next' }, { timeout: 5000 });
    await user.click(nextButton);

    const finishButton = await screen.findByRole('button', { name: 'Finish' }, { timeout: 5000 });
    await user.click(finishButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled();
    });

    const saved = mockSetData.mock.calls[0][0] as {
      resource: { extra_data?: Record<string, unknown> };
    };
    expect(saved.resource.extra_data).toEqual({});
  });
});
