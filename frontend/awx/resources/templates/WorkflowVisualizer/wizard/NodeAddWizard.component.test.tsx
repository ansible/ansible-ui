import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RESOURCE_TYPE, START_NODE_ID } from '../constants';
import { EdgeStatus, type WizardFormValues } from '../types';
import { NodeAddWizard } from './NodeAddWizard';
import type { BuildEffectivePromptParams } from './buildEffectivePrompt';

vi.mock('../../../../views/jobs/WorkflowOutput/WorkflowOutput', () => ({
  greyBadgeLabel: {
    badge: 'ALL',
    badgeColor: 'var(--pf-t--global--background--color--secondary--default)',
    badgeBorderColor: 'var(--pf-t--global--border--color--on-secondary)',
  },
}));

const mockCloseSidebar = vi.fn();
const mockCreateEdge = vi.fn((source: string, target: string, status: EdgeStatus) => ({
  id: `${source}-${target}`,
  type: 'edge',
  source,
  target,
  data: { tagStatus: status },
}));
const mockFromModel = vi.fn();
const mockSetState = vi.fn();
const mockLayout = vi.fn();
const mockSourceSetState = vi.fn();
const mockNewNodeSetState = vi.fn();
const mockSourceNodeSetStateAfterFromModel = vi.fn();

const EXISTING_GRAPH_NODE_ID = '1-unsavedNode';

let mockSourceNode:
  | {
      getId: () => string;
      setState: ReturnType<typeof vi.fn>;
    }
  | undefined;

let mockModel: { nodes: unknown[]; edges: unknown[] };

function getExistingGraphNodeId(): string {
  return EXISTING_GRAPH_NODE_ID;
}

function getMockGraphNodes() {
  return [{ getId: getExistingGraphNodeId }];
}

function getMockGraph() {
  return {
    getNodes: getMockGraphNodes,
    layout: mockLayout,
  };
}

function getMockControllerState() {
  return { sourceNode: mockSourceNode, modified: false };
}

function createMockVisualizationController() {
  return {
    getState: getMockControllerState,
    setState: mockSetState,
    getGraph: getMockGraph,
    toModel: () => mockModel,
    fromModel: mockFromModel,
    getNodeById: mockGetNodeById,
  };
}

function identityObserver(component: unknown) {
  return component;
}

const mockGetNodeById = vi.fn((id: string) => {
  if (id === '42') {
    return { setState: mockSourceNodeSetStateAfterFromModel };
  }
  return { setState: mockNewNodeSetState };
});

vi.mock('@patternfly/react-topology', () => ({
  useVisualizationController: vi.fn(createMockVisualizationController),
  NodeModel: {},
  NodeShape: { circle: 'circle' },
  EdgeTerminalType: { directional: 'directional' },
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
  observer: identityObserver,
  TopologySideBar: () => null,
  TopologyView: () => null,
}));

function createNodeTypeStepDefaults() {
  return {
    approval_description: 'Approval description',
    approval_name: 'Approval step',
    approval_timeout: 300,
    node_alias: '',
    node_convergence: 'any' as const,
    node_days_to_keep: 30,
    resource: null,
    resourceId: undefined,
    node_type: RESOURCE_TYPE.workflow_approval,
    node_status_type: EdgeStatus.success,
  };
}

function useNodeTypeStepDefaultsMock() {
  return createNodeTypeStepDefaults;
}

vi.mock('../hooks', () => ({
  useCloseSidebar: () => mockCloseSidebar,
  useCreateEdge: () => mockCreateEdge,
  useNodeTypeStepDefaults: useNodeTypeStepDefaultsMock,
}));

const mockBuildEffectivePrompt = vi.fn(
  ({ prompt, launchConfig, resourceOrganization }: BuildEffectivePromptParams) => ({
    effectivePrompt: {
      ...(prompt as object),
      organization: resourceOrganization,
      original: { launch_config: launchConfig },
    },
    isTemplateChange: false,
  })
);

function buildEffectivePromptMock(params: BuildEffectivePromptParams) {
  return mockBuildEffectivePrompt(params);
}

vi.mock('./buildEffectivePrompt', () => ({
  buildEffectivePrompt: buildEffectivePromptMock,
}));

function createDefaultFormValues(): WizardFormValues {
  return {
    approval_name: 'Approval step',
    approval_description: 'Approval description',
    launch_config: null,
    node_type: RESOURCE_TYPE.workflow_approval,
    resource: null,
    resourceId: undefined,
    approval_timeout: 300,
    node_alias: '',
    node_convergence: 'any',
    node_days_to_keep: 30,
    node_status_type: EdgeStatus.success,
    prompt: { credentials: [], labels: [], instance_groups: [] },
    survey: {},
  };
}

let mockFormValues: WizardFormValues = createDefaultFormValues();

function handleMockWizardSubmit(onSubmit: (values: WizardFormValues) => Promise<void>) {
  void onSubmit(mockFormValues);
}

function MockPageWizard({
  onSubmit,
  title,
}: {
  onSubmit: (values: WizardFormValues) => Promise<void>;
  title: string;
}) {
  return (
    <div>
      <div data-testid="wizard-title">{title}</div>
      <button
        type="button"
        data-testid="wizard-submit"
        onClick={() => handleMockWizardSubmit(onSubmit)}
      >
        Finish
      </button>
    </div>
  );
}

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageWizard: MockPageWizard,
  };
});

function expectFromModelCalled() {
  expect(mockFromModel).toHaveBeenCalled();
}

describe('NodeAddWizard submit', () => {
  beforeEach(() => {
    mockCloseSidebar.mockClear();
    mockCreateEdge.mockClear();
    mockFromModel.mockClear();
    mockSetState.mockClear();
    mockLayout.mockClear();
    mockSourceSetState.mockClear();
    mockNewNodeSetState.mockClear();
    mockSourceNodeSetStateAfterFromModel.mockClear();
    mockGetNodeById.mockClear();
    mockBuildEffectivePrompt.mockClear();
    mockSourceNode = undefined;
    mockModel = { nodes: [], edges: [] };
    mockFormValues = createDefaultFormValues();
  });

  async function submitWizard() {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NodeAddWizard />
      </MemoryRouter>
    );

    await user.click(screen.getByTestId('wizard-submit'));
    await waitFor(expectFromModelCalled);
  }

  it('should call buildEffectivePrompt and add a root edge when there is no source node', async () => {
    await submitWizard();

    expect(mockBuildEffectivePrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        originalTemplateId: undefined,
        newResourceId: undefined,
        resourceOrganization: undefined,
      })
    );
    expect(mockCreateEdge).toHaveBeenCalledWith(START_NODE_ID, '2-unsavedNode', EdgeStatus.info);
    expect(mockModel.edges).toHaveLength(1);
    expect(mockModel.nodes).toHaveLength(1);
    expect(mockNewNodeSetState).toHaveBeenCalledWith({ modified: true });
    expect(mockSourceNodeSetStateAfterFromModel).not.toHaveBeenCalled();
    expect(mockCloseSidebar).toHaveBeenCalled();
    expect(mockLayout).toHaveBeenCalled();
  });

  it('should link the new node from the source node and re-mark the source after fromModel', async () => {
    mockSourceNode = {
      getId: () => '42',
      setState: mockSourceSetState,
    };

    await submitWizard();

    expect(mockCreateEdge).toHaveBeenCalledWith('42', '2-unsavedNode', EdgeStatus.success);
    expect(mockSourceSetState).toHaveBeenCalledWith({ modified: true });
    expect(mockGetNodeById).toHaveBeenCalledWith('42');
    expect(mockSourceNodeSetStateAfterFromModel).toHaveBeenCalledWith({ modified: true });
    expect(mockCreateEdge).not.toHaveBeenCalledWith(
      START_NODE_ID,
      expect.any(String),
      expect.anything()
    );
  });

  it('should pass resource organization and id into buildEffectivePrompt', async () => {
    mockFormValues = {
      ...mockFormValues,
      node_type: RESOURCE_TYPE.job,
      resourceId: undefined,
      resource: {
        id: 9,
        name: 'Deploy',
        description: 'Deploy app',
        organization: 3,
      } as WizardFormValues['resource'],
      prompt: { credentials: [], labels: [], instance_groups: [] },
    };

    await submitWizard();

    expect(mockBuildEffectivePrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        newResourceId: 9,
        resourceOrganization: 3,
      })
    );
  });

  it('should create an always edge when node_status_type is info', async () => {
    mockSourceNode = {
      getId: () => '42',
      setState: mockSourceSetState,
    };
    mockFormValues = {
      ...mockFormValues,
      node_status_type: EdgeStatus.info,
    };

    await submitWizard();

    expect(mockCreateEdge).toHaveBeenCalledWith('42', '2-unsavedNode', EdgeStatus.info);
  });

  it('should create a failure edge when node_status_type is danger', async () => {
    mockSourceNode = {
      getId: () => '42',
      setState: mockSourceSetState,
    };
    mockFormValues = {
      ...mockFormValues,
      node_status_type: EdgeStatus.danger,
    };

    await submitWizard();

    expect(mockCreateEdge).toHaveBeenCalledWith('42', '2-unsavedNode', EdgeStatus.danger);
  });

  it('should default to an always edge when node_status_type is unset during link', async () => {
    mockSourceNode = {
      getId: () => '42',
      setState: mockSourceSetState,
    };
    mockFormValues = {
      ...mockFormValues,
      node_status_type: undefined,
    };

    await submitWizard();

    expect(mockCreateEdge).toHaveBeenCalledWith('42', '2-unsavedNode', EdgeStatus.info);
  });
});
