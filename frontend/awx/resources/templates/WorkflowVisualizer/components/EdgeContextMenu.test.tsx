import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const mockRemoveLink = vi.fn();

vi.mock('../ViewOptionsProvider', () => ({
  useViewOptions: () => ({ removeLink: mockRemoveLink }),
}));

vi.mock('@patternfly/react-topology', () => ({
  useVisualizationController: () => ({
    getState: () => ({ modified: false }),
    setState: vi.fn(),
  }),
  action: (fn: () => void) => fn,
  ContextMenuItem: ({
    children,
    onClick,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick} {...rest}>
      {children}
    </button>
  ),
  ContextMenuSeparator: () => <hr />,
  Edge: class {},
  ElementModel: class {},
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
}));

import { EdgeContextMenu, useEdgeMenuItems } from './EdgeContextMenu';
import { EdgeStatus } from '../types';

describe('useEdgeMenuItems', () => {
  it('returns menu labels for edge status changes', () => {
    const element = {
      setData: vi.fn(),
      setState: vi.fn(),
      getSource: () => ({ setState: vi.fn() }),
    };

    const { result } = renderHook(() => useEdgeMenuItems(element as never));
    expect(result.current.map((item) => item.label)).toEqual(
      expect.arrayContaining(['Run on success', 'Run always', 'Remove link'])
    );
  });
});

describe('EdgeContextMenu', () => {
  const edgeData = {
    tag: 'Run on success',
    tagStatus: EdgeStatus.success,
    endTerminalStatus: 'success',
    originalStatus: 'success',
  };

  const element = {
    getData: () => edgeData,
    setData: vi.fn(),
    setState: vi.fn(),
    getSource: () => ({ setState: vi.fn() }),
  };

  it('renders edge status menu actions', () => {
    render(<EdgeContextMenu element={element as never} />);

    expect(screen.getByText('Run on success')).toBeInTheDocument();
    expect(screen.getByText('Run always')).toBeInTheDocument();
    expect(screen.getByText('Remove link')).toBeInTheDocument();
  });

  it('removes link when remove action is clicked', async () => {
    const user = userEvent.setup();
    render(<EdgeContextMenu element={element as never} />);

    await user.click(screen.getByText('Remove link'));

    expect(mockRemoveLink).toHaveBeenCalledWith(element);
  });
});
