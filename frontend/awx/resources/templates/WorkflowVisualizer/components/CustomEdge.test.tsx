import { describe, expect, it, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
  Layer: ({ children }: { children: React.ReactNode }) => <g>{children}</g>,
  StatusModifier: { success: 'pf-m-success' },
  TOP_LAYER: 'top',
  isEdge: () => true,
  observer: (component: unknown) => component,
  useHover: () => [false, vi.fn()],
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
}));

vi.mock('../hooks/useGetPath', () => ({
  useGetPath: () => ({
    path: 'M0 0 L10 10',
    centerPoint: { x: 5, y: 5 },
  }),
}));

vi.mock('./CustomLabel', () => ({
  CustomLabel: ({ children }: { children: React.ReactNode }) => <text>{children}</text>,
}));

vi.mock('./EdgeTerminal', () => ({
  EdgeTerminal: () => <polygon data-testid="edge-terminal" />,
}));

import { render, screen } from '@testing-library/react';
import { CustomEdge } from './CustomEdge';
import { EdgeStatus } from '../types';

describe('CustomEdge', () => {
  it('renders edge with tag and workflow test id', () => {
    const element = {
      getData: () => ({
        tag: 'Run on success',
        tagStatus: EdgeStatus.success,
      }),
      getSource: () => ({ getId: () => 'start' }),
      getTarget: () => ({ getPosition: () => ({ x: 0, y: 0 }) }),
    };

    render(<CustomEdge element={element as never} />);

    expect(screen.getByTestId('workflow-visualizer-edge')).toBeInTheDocument();
    expect(screen.getByText('Run on success')).toBeInTheDocument();
    expect(screen.getByTestId('edge-terminal')).toBeInTheDocument();
  });
});
