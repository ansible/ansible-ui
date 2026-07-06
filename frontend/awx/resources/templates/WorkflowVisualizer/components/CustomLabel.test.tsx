/* eslint-disable i18next/no-literal-string */
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EdgeStatus } from '../types';

let mockTextSize: { width: number; height: number } | null = { width: 80, height: 20 };
let mockIconSize: { width: number; height: number } | null = { width: 16, height: 16 };

vi.mock('@patternfly/react-topology', () => ({
  useSize: vi.fn((_deps: unknown[]) => {
    if (_deps && Array.isArray(_deps) && typeof _deps[0] !== 'string') {
      return [mockIconSize, vi.fn()];
    }
    return [mockTextSize, vi.fn()];
  }),
  observer: (component: unknown) => component,
  useVisualizationController: vi.fn(),
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
}));

import { CustomLabel } from './CustomLabel';

function renderLabel(overrides: Record<string, unknown> = {}) {
  const defaults = {
    xPoint: 100,
    yPoint: 50,
    status: EdgeStatus.success,
    onContextMenu: vi.fn(),
    hoverRef: vi.fn(),
    isSourceRootNode: false,
  };

  return render(
    <svg>
      <CustomLabel {...defaults} {...overrides}>
        Always
      </CustomLabel>
    </svg>
  );
}

describe('CustomLabel', () => {
  it('should render the label text', () => {
    const { container } = renderLabel();
    const text = container.querySelector('text');
    expect(text).toBeInTheDocument();
    expect(text?.textContent).toBe('Always');
  });

  it('should render a rect when textSize is available', () => {
    const { container } = renderLabel();
    const rect = container.querySelector('rect');
    expect(rect).toBeInTheDocument();
  });

  it('should not render rect when textSize is null', () => {
    mockTextSize = null;
    const { container } = renderLabel();
    const rect = container.querySelector('rect');
    expect(rect).not.toBeInTheDocument();
    mockTextSize = { width: 80, height: 20 };
  });

  it('should render context menu kebab for non-root nodes', () => {
    const { container } = renderLabel({ isSourceRootNode: false });
    const kebab = container.querySelector('[data-testid="edge-context-menu_kebab"]');
    expect(kebab).toBeInTheDocument();
  });

  it('should not render context menu kebab for root nodes', () => {
    const { container } = renderLabel({ isSourceRootNode: true });
    const kebab = container.querySelector('[data-testid="edge-context-menu_kebab"]');
    expect(kebab).not.toBeInTheDocument();
  });

  it('should not render context menu kebab when onContextMenu is undefined', () => {
    const { container } = renderLabel({ onContextMenu: undefined });
    const kebab = container.querySelector('[data-testid="edge-context-menu_kebab"]');
    expect(kebab).not.toBeInTheDocument();
  });

  it('should call onContextMenu when kebab is clicked', () => {
    const onContextMenu = vi.fn();
    const { container } = renderLabel({ onContextMenu });
    const kebab = container.querySelector('[data-testid="edge-context-menu_kebab"]');
    kebab?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onContextMenu).toHaveBeenCalledOnce();
  });

  it('should render the node-context-menu_kebab icon group', () => {
    const { container } = renderLabel();
    const iconGroup = container.querySelector('[data-testid="node-context-menu_kebab"]');
    expect(iconGroup).toBeInTheDocument();
  });

  it('should render separator line for non-root nodes with context menu', () => {
    const { container } = renderLabel();
    const line = container.querySelector('line.pf-topology__node__separator');
    expect(line).toBeInTheDocument();
  });

  it('should use wider rect for root nodes', () => {
    const { container } = renderLabel({ isSourceRootNode: true });
    const rect = container.querySelector('rect');
    expect(rect).toBeInTheDocument();
    expect(Number(rect?.getAttribute('width'))).toBe(100);
  });

  it('should use wider rect with context area for non-root nodes', () => {
    const { container } = renderLabel({ isSourceRootNode: false });
    const rect = container.querySelector('rect');
    expect(rect).toBeInTheDocument();
    expect(Number(rect?.getAttribute('width'))).toBe(130);
  });

  it('should not render kebab path when iconSize is null', () => {
    mockIconSize = null;
    const { container } = renderLabel();
    const kebab = container.querySelector('[data-testid="edge-context-menu_kebab"]');
    expect(kebab).not.toBeInTheDocument();
    mockIconSize = { width: 16, height: 16 };
  });
});
