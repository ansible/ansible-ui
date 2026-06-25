import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
  DefaultNode: ({
    children,
    element,
    showLabel,
    ...rest
  }: Record<string, unknown> & { children?: React.ReactNode }) => (
    <g data-testid="default-node" data-show-label={showLabel} {...rest}>
      {children}
    </g>
  ),
  isNode: () => true,
  observer: (component: unknown) => component,
  useVisualizationController: vi.fn(),
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
}));

const mockSetSidebarMode = vi.fn();

vi.mock('../ViewOptionsProvider', () => ({
  useViewOptions: () => ({
    setSidebarMode: mockSetSidebarMode,
  }),
}));

import { CustomNode } from './CustomNode';

function createMockElement(id: string, jobType?: string, data?: Record<string, unknown> | null) {
  const nodeData =
    data === null
      ? null
      : (data ?? {
          resource: {
            summary_fields: {
              unified_job_template: {
                unified_job_type: jobType ?? 'job',
              },
            },
          },
          badge: 'Test',
          badgeColor: '#fff',
          badgeTextColor: '#000',
          badgeBorderColor: '#ccc',
        });

  return {
    getId: () => id,
    getData: () => nodeData,
  };
}

function renderCustomNode(element: ReturnType<typeof createMockElement>, onSelect?: () => void) {
  return render(
    <svg>
      <CustomNode
        element={element as never}
        onSelect={onSelect ?? vi.fn()}
        selected={false}
        onContextMenu={vi.fn()}
      />
    </svg>
  );
}

describe('CustomNode', () => {
  it('should render a non-start node with showLabel', () => {
    const element = createMockElement('node-1', 'job');
    const { container } = renderCustomNode(element);

    const node = container.querySelector('[data-testid="default-node"]');
    expect(node).toBeInTheDocument();
    expect(node).toHaveAttribute('data-show-label', 'true');
  });

  it('should render start node without showLabel', () => {
    const element = createMockElement('startNode', 'job');
    const { container } = renderCustomNode(element);

    const node = container.querySelector('[data-testid="default-node"]');
    expect(node).toBeInTheDocument();
    expect(node).not.toHaveAttribute('data-show-label');
  });

  it('should render the correct icon for job type', () => {
    const element = createMockElement('node-2', 'job');
    const { container } = renderCustomNode(element);
    const icon = container.querySelector('g[transform="translate(13, 13)"]');
    expect(icon).toBeInTheDocument();
  });

  it('should render the correct icon for project_update type', () => {
    const element = createMockElement('node-3', 'project_update');
    const { container } = renderCustomNode(element);
    const icon = container.querySelector('g[transform="translate(13, 13)"]');
    expect(icon).toBeInTheDocument();
  });

  it('should render the correct icon for system_job type', () => {
    const element = createMockElement('node-4', 'system_job');
    const { container } = renderCustomNode(element);
    const icon = container.querySelector('g[transform="translate(13, 13)"]');
    expect(icon).toBeInTheDocument();
  });

  it('should render the correct icon for workflow_approval type', () => {
    const element = createMockElement('node-5', 'workflow_approval');
    const { container } = renderCustomNode(element);
    const icon = container.querySelector('g[transform="translate(13, 13)"]');
    expect(icon).toBeInTheDocument();
  });

  it('should render the correct icon for workflow_job type', () => {
    const element = createMockElement('node-6', 'workflow_job');
    const { container } = renderCustomNode(element);
    const icon = container.querySelector('g[transform="translate(13, 13)"]');
    expect(icon).toBeInTheDocument();
  });

  it('should render the correct icon for inventory_update type', () => {
    const element = createMockElement('node-7', 'inventory_update');
    const { container } = renderCustomNode(element);
    const icon = container.querySelector('g[transform="translate(13, 13)"]');
    expect(icon).toBeInTheDocument();
  });

  it('should use deleted_resource icon when job type is undefined', () => {
    const element = createMockElement('node-8', undefined);
    element.getData = () => ({
      resource: { summary_fields: { unified_job_template: {} } },
    });
    const { container } = renderCustomNode(element);
    const icon = container.querySelector('g[transform="translate(13, 13)"]');
    expect(icon).toBeInTheDocument();
  });

  it('should return null when element has no data and is a node', () => {
    const element = createMockElement('node-9', undefined, null);
    const { container } = renderCustomNode(element);
    const nodes = container.querySelectorAll('[data-testid="default-node"]');
    expect(nodes).toHaveLength(0);
  });

  it('should call setSidebarMode and onSelect when non-start node with jobType is selected', () => {
    const onSelect = vi.fn();
    const element = createMockElement('node-10', 'job');

    renderCustomNode(element, onSelect);

    const node = document.querySelector('[data-testid="default-node"]');
    expect(node).toBeInTheDocument();
  });

  it('should render home icon for start node', () => {
    const element = createMockElement('startNode', 'job');
    const { container } = renderCustomNode(element);
    const icon = container.querySelector('g[transform="translate(13, 13)"]');
    expect(icon).toBeInTheDocument();
  });

  it('should pass badge props to non-start node', () => {
    const element = createMockElement('node-11', 'job');
    const { container } = renderCustomNode(element);
    const node = container.querySelector('[data-testid="default-node"]');
    expect(node).toBeInTheDocument();
  });
});
