import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
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

import { AddNodeButton } from './AddNodeButton';

describe('AddNodeButton', () => {
  it('should render with default label "Add step"', () => {
    render(<AddNodeButton />);
    expect(screen.getByRole('button', { name: /Add step/i })).toBeInTheDocument();
  });

  it('should call setSidebarMode with "add" on click', async () => {
    const user = userEvent.setup();
    render(<AddNodeButton />);

    await user.click(screen.getByRole('button', { name: /Add step/i }));

    expect(mockSetSidebarMode).toHaveBeenCalledWith('add');
  });

  it('should use default id when none is provided', () => {
    render(<AddNodeButton />);
    expect(screen.getByTestId('add-node-button')).toBeInTheDocument();
  });

  it('should use custom id when provided', () => {
    render(<AddNodeButton id="custom-btn" />);
    expect(screen.getByTestId('custom-btn')).toBeInTheDocument();
  });

  it('should render with primary variant when specified', () => {
    render(<AddNodeButton variant="primary" />);
    const button = screen.getByRole('button', { name: /Add step/i });
    expect(button).toHaveClass('pf-m-primary');
  });

  it('should render with secondary variant by default', () => {
    render(<AddNodeButton />);
    const button = screen.getByRole('button', { name: /Add step/i });
    expect(button).toHaveClass('pf-m-secondary');
  });
});
