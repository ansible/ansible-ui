import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RESOURCE_TYPE } from '../constants';
import { EdgeStatus } from '../types';
import { NodeEditWizard } from './NodeEditWizard';

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

const mockGetInitialValues = vi.fn(() =>
  Promise.resolve({
    nodeTypeStep: {
      node_type: RESOURCE_TYPE.job,
      node_convergence: 'any' as const,
      node_alias: '',
      approval_name: '',
      approval_description: '',
      approval_timeout: 0,
      node_days_to_keep: 30,
      resource: { id: 1, name: 'Demo Template' } as never,
      resourceId: 1,
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
  isVisible: () => true,
} as never;

describe('NodeEditWizard', () => {
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
});
