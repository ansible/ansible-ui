import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
  observer: (component: unknown) => component,
  useVisualizationController: vi.fn(),
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
}));

import type { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { SystemJobNodeDetails } from './SystemJobNodeDetails';

function makeNode(overrides: Partial<WorkflowNode> = {}): WorkflowNode {
  return {
    id: 1,
    identifier: 'sys-node-1',
    created: '2024-01-15T10:30:00Z',
    modified: '2024-06-20T14:00:00Z',
    all_parents_must_converge: false,
    extra_data: { days: 30 },
    summary_fields: {
      unified_job_template: {
        id: 1,
        name: 'Cleanup Expired Sessions',
        description: 'Removes expired sessions from the database',
        unified_job_type: 'system_job',
      },
    },
    ...overrides,
  } as unknown as WorkflowNode;
}

function renderComponent(node: WorkflowNode, disableScroll?: boolean) {
  return render(
    <MemoryRouter>
      <SystemJobNodeDetails selectedNode={node} disableScroll={disableScroll} />
    </MemoryRouter>
  );
}

describe('SystemJobNodeDetails', () => {
  it('should render the node identifier as the name', () => {
    renderComponent(makeNode());
    expect(screen.getByText('sys-node-1')).toBeInTheDocument();
  });

  it('should render template name when identifier is not set', () => {
    renderComponent(makeNode({ identifier: undefined as unknown as string }));
    expect(screen.getByText('Cleanup Expired Sessions')).toBeInTheDocument();
  });

  it('should render the description', () => {
    renderComponent(makeNode());
    expect(screen.getByText('Removes expired sessions from the database')).toBeInTheDocument();
  });

  it('should hide description section when description is empty', () => {
    const node = makeNode();
    (node.summary_fields.unified_job_template as Record<string, unknown>).description = '';
    renderComponent(node);
    expect(screen.queryByText('Description')).not.toBeInTheDocument();
  });

  it('should render the type as "System job template"', () => {
    renderComponent(makeNode());
    expect(screen.getByText('System job template')).toBeInTheDocument();
  });

  it('should render convergence as "Any" when all_parents_must_converge is false', () => {
    renderComponent(makeNode({ all_parents_must_converge: false }));
    expect(screen.getByText('Any')).toBeInTheDocument();
  });

  it('should render convergence as "All" when all_parents_must_converge is true', () => {
    renderComponent(makeNode({ all_parents_must_converge: true }));
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('should render the created date', () => {
    renderComponent(makeNode());
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('should render the modified date', () => {
    renderComponent(makeNode());
    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it('should render the variables section', () => {
    renderComponent(makeNode());
    expect(screen.getByText('Variables')).toBeInTheDocument();
  });

  it('should render extra_data as JSON in the variables section', () => {
    renderComponent(makeNode({ extra_data: { days: 120 } }));
    expect(screen.getByText('Variables')).toBeInTheDocument();
  });
});
