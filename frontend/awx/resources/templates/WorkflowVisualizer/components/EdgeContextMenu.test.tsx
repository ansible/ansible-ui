import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRemoveLink = vi.fn();
const mockControllerSetState = vi.fn();

vi.mock('../ViewOptionsProvider', () => ({
  useViewOptions: () => ({ removeLink: mockRemoveLink }),
}));

vi.mock('@patternfly/react-topology', () => ({
  useVisualizationController: () => ({
    getState: () => ({ modified: false }),
    setState: mockControllerSetState,
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

beforeEach(() => {
  vi.clearAllMocks();
});

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

  it('renders a separator between status actions and remove', () => {
    render(<EdgeContextMenu element={element as never} />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('marks the edge modified when the status changes', async () => {
    const user = userEvent.setup();
    const sourceSetState = vi.fn();
    const changed = {
      ...element,
      setData: vi.fn(),
      setState: vi.fn(),
      getSource: () => ({ setState: sourceSetState }),
      getData: () => ({ ...edgeData, originalStatus: 'danger' }),
    };
    render(<EdgeContextMenu element={changed as never} />);

    await user.click(screen.getByText('Run on success'));
    await user.click(screen.getByText('Run always'));
    await user.click(screen.getByText('Run on fail'));

    expect(changed.setData).toHaveBeenCalledWith(
      expect.objectContaining({ tagStatus: EdgeStatus.success, endTerminalStatus: 'success' })
    );
    expect(changed.setData).toHaveBeenCalledWith(
      expect.objectContaining({ tagStatus: EdgeStatus.info, endTerminalStatus: 'info' })
    );
    expect(changed.setData).toHaveBeenCalledWith(
      expect.objectContaining({ tagStatus: EdgeStatus.danger, endTerminalStatus: 'fail' })
    );
    expect(changed.setState).toHaveBeenCalledWith({ modified: true });
    expect(sourceSetState).toHaveBeenCalledWith({ modified: true });
    expect(mockControllerSetState).toHaveBeenCalledWith(
      expect.objectContaining({ modified: true })
    );
  });

  it('clears the modified flag when the original status is selected again', async () => {
    const user = userEvent.setup();
    const sourceSetState = vi.fn();
    const unchanged = {
      ...element,
      setData: vi.fn(),
      setState: vi.fn(),
      getSource: () => ({ setState: sourceSetState }),
    };
    render(<EdgeContextMenu element={unchanged as never} />);

    await user.click(screen.getByText('Run on success'));

    expect(unchanged.setState).toHaveBeenCalledWith({ modified: false });
    expect(sourceSetState).toHaveBeenCalledWith({ modified: false });
    expect(mockControllerSetState).not.toHaveBeenCalled();
  });

  it('does not update the edge when menu data is missing', async () => {
    const user = userEvent.setup();
    const missing = {
      ...element,
      getData: () => undefined,
      setData: vi.fn(),
    };
    render(<EdgeContextMenu element={missing as never} />);

    await user.click(screen.getByText('Run on success'));
    await user.click(screen.getByText('Run always'));
    await user.click(screen.getByText('Run on fail'));

    expect(missing.setData).not.toHaveBeenCalled();
  });
});
