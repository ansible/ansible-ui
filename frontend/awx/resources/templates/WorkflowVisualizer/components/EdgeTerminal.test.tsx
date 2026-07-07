import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Point } from '@patternfly/react-topology';

vi.mock('@patternfly/react-topology', () => ({
  Point: vi.fn(),
  observer: (component: unknown) => component,
  useVisualizationController: vi.fn(),
}));

import { EdgeTerminal } from './EdgeTerminal';

describe('EdgeTerminal', () => {
  it('should render a polygon with the correct transform', () => {
    const target = { x: 100, y: 50 };
    const { container } = render(
      <svg>
        <EdgeTerminal target={target as unknown as Point} style="pf-m-success" />
      </svg>
    );

    const group = container.querySelector('g');
    expect(group).toHaveAttribute('transform', 'translate(86, 75)');
  });

  it('should apply the style class to the polygon', () => {
    const target = { x: 200, y: 100 };
    const { container } = render(
      <svg>
        <EdgeTerminal target={target as unknown as Point} style="pf-m-danger" />
      </svg>
    );

    const polygon = container.querySelector('polygon');
    expect(polygon).toBeInTheDocument();
    expect(polygon?.getAttribute('class')).toContain('pf-m-danger');
  });

  it('should render the correct polygon points', () => {
    const target = { x: 50, y: 25 };
    const { container } = render(
      <svg>
        <EdgeTerminal target={target as unknown as Point} style="pf-m-info" />
      </svg>
    );

    const polygon = container.querySelector('polygon');
    expect(polygon).toHaveAttribute('points', ' 0,7 0,-7 14,0');
  });
});
