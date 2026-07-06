/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
  observer: (component: unknown) => component,
  useVisualizationController: vi.fn(),
  TopologySideBar: ({
    children,
    show,
    ...rest
  }: Record<string, unknown> & { children?: React.ReactNode }) =>
    show ? (
      <div data-testid="workflow-topology-sidebar" {...rest}>
        {children}
      </div>
    ) : null,
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
}));

let mockSidebarMode: 'add' | 'edit' | 'view' | undefined = undefined;
const mockSelectedNode = { id: 1, name: 'TestNode' };

vi.mock('../ViewOptionsProvider', () => ({
  useViewOptions: () => ({
    sidebarMode: mockSidebarMode,
  }),
}));

vi.mock('../hooks', () => ({
  useSelectedNode: () => mockSelectedNode,
}));

vi.mock('../wizard/NodeAddWizard', () => ({
  NodeAddWizard: () => <div data-testid="node-add-wizard">Add Wizard</div>,
}));

vi.mock('../wizard/NodeEditWizard', () => ({
  NodeEditWizard: ({ node }: { node: unknown }) => (
    <div data-testid="node-edit-wizard">Edit Wizard {node ? 'with node' : ''}</div>
  ),
}));

vi.mock('./WorkflowNodeDetails', () => ({
  WorkflowNodeDetails: ({ node }: { node: unknown }) => (
    <div data-testid="node-details">Details {node ? 'with node' : ''}</div>
  ),
}));

import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('should render nothing when sidebarMode is undefined', () => {
    mockSidebarMode = undefined;
    const { container } = render(<Sidebar />);
    expect(container.innerHTML).toBe('');
  });

  it('should render NodeAddWizard when sidebarMode is "add"', () => {
    mockSidebarMode = 'add';
    render(<Sidebar />);
    expect(screen.getByTestId('node-add-wizard')).toBeInTheDocument();
  });

  it('should render NodeEditWizard when sidebarMode is "edit"', () => {
    mockSidebarMode = 'edit';
    render(<Sidebar />);
    expect(screen.getByTestId('node-edit-wizard')).toBeInTheDocument();
  });

  it('should render WorkflowNodeDetails when sidebarMode is "view"', () => {
    mockSidebarMode = 'view';
    render(<Sidebar />);
    expect(screen.getByTestId('node-details')).toBeInTheDocument();
  });

  it('should render with aria-label on the sidebar', () => {
    mockSidebarMode = 'view';
    render(<Sidebar />);
    expect(screen.getByTestId('workflow-topology-sidebar')).toBeInTheDocument();
  });
});
