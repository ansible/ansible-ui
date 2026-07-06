/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ControllerState } from '../types';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const mockSave = vi.fn().mockResolvedValue(undefined);
const mockRemoveNodes = vi.fn();
const mockLaunch = vi.fn();
const mockToggleFullScreen = vi.fn();
const mockPageNavigate = vi.fn();
const mockAlertToaster = { addAlert: vi.fn() };

let mockControllerState: Partial<ControllerState> = {};
let mockIsFullScreen = false;
let mockNodes: { isVisible: () => boolean; getId: () => string }[] = [];
let mockElements: { getState: () => Partial<ControllerState> }[] = [];

vi.mock('@patternfly/react-topology', () => ({
  observer: (component: unknown) => component,
  useVisualizationController: () => ({
    getState: <T,>() => mockControllerState as T,
    getGraph: () => ({
      getNodes: () => mockNodes,
    }),
    getElements: () => mockElements,
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
    usePageAlertToaster: () => mockAlertToaster,
  };
});

vi.mock('@ansible/common-ui/utils/useGetDocsUrl', () => ({
  useGetDocsUrl: () => 'https://docs.example.com/workflow',
}));

vi.mock('../../../../common/useAwxConfig', () => ({
  useAwxConfig: () => ({}),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ id: '1' }) };
});

vi.mock('../hooks', () => ({
  useSaveVisualizer: () => mockSave,
  useRemoveGraphElements: () => ({ removeNodes: mockRemoveNodes }),
}));

vi.mock('../../hooks/useLaunchTemplate', () => ({
  useLaunchTemplate: () => mockLaunch,
}));

vi.mock('../ViewOptionsProvider', () => ({
  useViewOptions: () => ({
    isFullScreen: mockIsFullScreen,
    toggleFullScreen: mockToggleFullScreen,
  }),
}));

vi.mock('./AddNodeButton', () => ({
  AddNodeButton: () => <button data-testid="add-node-button">Add node</button>,
}));

afterEach(() => {
  vi.clearAllMocks();
  mockControllerState = {};
  mockIsFullScreen = false;
  mockNodes = [];
  mockElements = [];
});

const { WorkflowVisualizerToolbar, ToolbarHeader } = await import('./WorkflowVisualizerToolbar');

function renderToolbar() {
  return render(
    <MemoryRouter>
      <WorkflowVisualizerToolbar />
    </MemoryRouter>
  );
}

function renderToolbarHeader() {
  return render(
    <MemoryRouter>
      <ToolbarHeader />
    </MemoryRouter>
  );
}

function makeVisibleNode(id: string) {
  return { isVisible: () => true, getId: () => id, getData: () => ({}) };
}

describe('WorkflowVisualizerToolbar', () => {
  it('should render save button when RBAC.edit is true', () => {
    mockControllerState = {
      RBAC: { edit: true, start: false },
      modified: false,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    renderToolbar();

    expect(screen.getByTestId('workflow-visualizer-toolbar-save')).toBeInTheDocument();
  });

  it('should disable save button when not modified', () => {
    mockControllerState = {
      RBAC: { edit: true, start: false },
      modified: false,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    renderToolbar();

    expect(screen.getByTestId('workflow-visualizer-toolbar-save')).toBeDisabled();
  });

  it('should enable save button when modified', () => {
    mockControllerState = {
      RBAC: { edit: true, start: false },
      modified: true,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    renderToolbar();

    expect(screen.getByTestId('workflow-visualizer-toolbar-save')).not.toBeDisabled();
  });

  it('should call handleSave on save button click', async () => {
    mockControllerState = {
      RBAC: { edit: true, start: false },
      modified: true,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    const user = userEvent.setup();
    renderToolbar();

    await user.click(screen.getByTestId('workflow-visualizer-toolbar-save'));

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledOnce();
    });
  });

  it('should show success alert after save', async () => {
    mockControllerState = {
      RBAC: { edit: true, start: false },
      modified: true,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    const user = userEvent.setup();
    renderToolbar();

    await user.click(screen.getByTestId('workflow-visualizer-toolbar-save'));

    await waitFor(() => {
      expect(mockAlertToaster.addAlert).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'success' })
      );
    });
  });

  it('should show error alert when save fails', async () => {
    mockSave.mockRejectedValueOnce(new Error('Save failed'));
    mockControllerState = {
      RBAC: { edit: true, start: false },
      modified: true,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    const user = userEvent.setup();
    renderToolbar();

    await user.click(screen.getByTestId('workflow-visualizer-toolbar-save'));

    await waitFor(() => {
      expect(mockAlertToaster.addAlert).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'danger' })
      );
    });
  });

  it('should hide save button when RBAC.edit is false', () => {
    mockControllerState = {
      RBAC: { edit: false, start: true },
      modified: false,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    renderToolbar();

    expect(screen.queryByTestId('workflow-visualizer-toolbar-save')).not.toBeInTheDocument();
  });

  it('should render launch button when RBAC.start is true', () => {
    mockControllerState = {
      RBAC: { edit: false, start: true },
      modified: false,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    mockNodes = [makeVisibleNode('node-1')];
    renderToolbar();

    expect(screen.getByTestId('launch-workflow-button')).toBeInTheDocument();
  });

  it('should disable launch when modified', () => {
    mockControllerState = {
      RBAC: { edit: true, start: true },
      modified: true,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    mockNodes = [makeVisibleNode('node-1')];
    renderToolbar();

    expect(screen.getByTestId('launch-workflow-button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable launch when no nodes', () => {
    mockControllerState = {
      RBAC: { edit: true, start: true },
      modified: false,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    mockNodes = [];
    renderToolbar();

    expect(screen.getByTestId('launch-workflow-button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('should show total nodes badge with correct count', () => {
    mockControllerState = {
      RBAC: { edit: true, start: true },
      modified: false,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    mockNodes = [makeVisibleNode('node-1'), makeVisibleNode('node-2')];
    renderToolbar();

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Total nodes')).toBeInTheDocument();
  });

  it('should render expand button when not in fullscreen', () => {
    mockControllerState = {
      RBAC: { edit: true, start: true },
      modified: false,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    mockIsFullScreen = false;
    renderToolbar();

    expect(screen.getByRole('button', { name: 'Expand' })).toBeInTheDocument();
  });

  it('should call toggleFullScreen on expand/collapse click', async () => {
    mockControllerState = {
      RBAC: { edit: true, start: true },
      modified: false,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    const user = userEvent.setup();
    renderToolbar();

    await user.click(screen.getByRole('button', { name: 'Expand' }));

    expect(mockToggleFullScreen).toHaveBeenCalledOnce();
  });

  it('should filter out START_NODE_ID from node count', () => {
    mockControllerState = {
      RBAC: { edit: true, start: true },
      modified: false,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    mockNodes = [
      { isVisible: () => true, getId: () => '1' },
      { isVisible: () => true, getId: () => '1' },
    ];
    renderToolbar();

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render add node button when RBAC.edit is true', () => {
    mockControllerState = {
      RBAC: { edit: true, start: false },
      modified: false,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    renderToolbar();

    expect(screen.getByTestId('add-node-button')).toBeInTheDocument();
  });

  it('should hide add node button when RBAC.edit is false', () => {
    mockControllerState = {
      RBAC: { edit: false, start: true },
      modified: false,
      workflowTemplate: { id: 1, name: 'Test WF', type: 'workflow_job_template' },
    } as ControllerState;
    renderToolbar();

    expect(screen.queryByTestId('add-node-button')).not.toBeInTheDocument();
  });
});

describe('ToolbarHeader', () => {
  it('should render workflow visualizer title and template name', () => {
    mockControllerState = {
      workflowTemplate: { id: 1, name: 'My Workflow', type: 'workflow_job_template' },
    } as ControllerState;
    mockElements = [{ getState: () => ({ modified: false }) }];
    renderToolbarHeader();

    expect(screen.getByText('Workflow Visualizer')).toBeInTheDocument();
    expect(screen.getByText('My Workflow')).toBeInTheDocument();
  });

  it('should render close button', () => {
    mockControllerState = {
      workflowTemplate: { id: 1, name: 'My Workflow', type: 'workflow_job_template' },
    } as ControllerState;
    mockElements = [{ getState: () => ({ modified: false }) }];
    renderToolbarHeader();

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('should navigate directly on close when not modified', async () => {
    mockControllerState = {
      workflowTemplate: { id: 1, name: 'My Workflow', type: 'workflow_job_template' },
    } as ControllerState;
    mockElements = [{ getState: () => ({ modified: false }) }];
    const user = userEvent.setup();
    renderToolbarHeader();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(mockPageNavigate).toHaveBeenCalled();
  });
});
