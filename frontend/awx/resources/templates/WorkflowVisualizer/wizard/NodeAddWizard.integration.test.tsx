import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RESOURCE_TYPE, START_NODE_ID } from '../constants';
import { EdgeStatus } from '../types';
import { NodeAddWizard } from './NodeAddWizard';

vi.mock('../../../../views/jobs/WorkflowOutput/WorkflowOutput', () => ({
  greyBadgeLabel: {
    badge: 'ALL',
    badgeColor: 'var(--pf-t--global--background--color--secondary--default)',
    badgeBorderColor: 'var(--pf-t--global--border--color--on-secondary)',
  },
}));

vi.mock('./NodeReviewStep', () => ({ NodeReviewStep: () => null }));
vi.mock('./NodePromptsStep', () => ({ NodePromptsStep: () => null }));
vi.mock('../../../../common/SurveyStep', () => ({ SurveyStep: () => null }));

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
    node_status_type: EdgeStatus.info,
  };
}

function useNodeTypeStepDefaultsMock() {
  return createNodeTypeStepDefaults;
}

vi.mock('../hooks', () => ({
  useCloseSidebar: () => mockCloseSidebar,
  useCreateEdge: () => mockCreateEdge,
  useGetNodeTypeDetail: () => 'Approval',
  useGetTimeoutString: () => '5 min 0 sec',
  useNodeTypeStepDefaults: useNodeTypeStepDefaultsMock,
}));

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => ({ data: { actions: { POST: {} } } }),
}));

function expectFromModelCalled() {
  expect(mockFromModel).toHaveBeenCalled();
}

describe('NodeAddWizard integration', () => {
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
    mockSourceNode = {
      getId: () => '42',
      setState: mockSourceSetState,
    };
    mockModel = { nodes: [], edges: [] };
  });

  it('should submit through the real wizard and link from the source node', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NodeAddWizard />
      </MemoryRouter>
    );

    const nextButton = await screen.findByRole('button', { name: 'Next' }, { timeout: 5000 });
    await user.click(nextButton);

    const finishButton = await screen.findByRole('button', { name: 'Finish' }, { timeout: 5000 });
    await user.click(finishButton);

    await waitFor(expectFromModelCalled, { timeout: 5000 });

    expect(mockCreateEdge).toHaveBeenCalledWith('42', '2-unsavedNode', EdgeStatus.info);
    expect(mockCreateEdge).not.toHaveBeenCalledWith(
      START_NODE_ID,
      expect.any(String),
      expect.anything()
    );
    expect(mockSourceSetState).toHaveBeenCalledWith({ modified: true });
    expect(mockSourceNodeSetStateAfterFromModel).toHaveBeenCalledWith({ modified: true });
    expect(mockCloseSidebar).toHaveBeenCalled();
    expect(mockLayout).toHaveBeenCalled();
  });
});
