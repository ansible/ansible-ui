// @vitest-environment happy-dom
import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GraphElement } from '@patternfly/react-topology';
import { useStatusDecorator } from './useStatusDecorator';

vi.mock('@patternfly/react-topology', () => ({
  DEFAULT_DECORATOR_RADIUS: 12,
  Decorator: (props: {
    icon?: React.ReactNode;
    'data-testid'?: string;
    'data-cy'?: string;
    ariaLabel?: string;
  }) => (
    <div data-testid={props['data-testid']} data-cy={props['data-cy']} aria-label={props.ariaLabel}>
      {props.icon}
    </div>
  ),
  getDefaultShapeDecoratorCenter: () => ({ x: 5, y: 5 }),
  TopologyQuadrant: { upperLeft: 0 },
  isNode: (element: GraphElement) =>
    Boolean((element as GraphElement & { isWorkflowNode?: boolean }).isWorkflowNode),
}));

function createWorkflowNodeElement(status: string, id = '42'): GraphElement {
  return {
    isWorkflowNode: true,
    getNodeStatus: () => status,
    getId: () => id,
  } as unknown as GraphElement;
}

describe('useStatusDecorator', () => {
  it('should return null when element is not a node', () => {
    const { result } = renderHook(() => useStatusDecorator());
    expect(result.current({} as unknown as GraphElement)).toBeNull();
  });

  it('should return null when status has no decorator icon', () => {
    const { result } = renderHook(() => useStatusDecorator());
    expect(result.current(createWorkflowNodeElement('default'))).toBeNull();
  });

  it('should render a decorator with status icon for workflow nodes', () => {
    const { result } = renderHook(() => useStatusDecorator());
    const decorator = result.current(createWorkflowNodeElement('successful', '99'));
    render(decorator);

    expect(screen.getByTestId('node-decorator-successful')).toBeInTheDocument();
    expect(screen.getByTestId('successful-icon')).toBeInTheDocument();
    expect(screen.getByTestId('node-decorator-successful')).toHaveAttribute(
      'aria-label',
      'successful'
    );
  });
});
