import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ViewOptionsProvider, useViewOptions } from './ViewOptionsProvider';

const mockRemoveNodes = vi.fn();
const mockRemoveLink = vi.fn();

vi.mock('./hooks', () => ({
  useRemoveGraphElements: () => ({
    removeNodes: mockRemoveNodes,
    removeLink: mockRemoveLink,
  }),
}));

vi.mock('@patternfly/react-topology', () => ({
  observer: (component: unknown) => component,
  useVisualizationController: () => ({
    getState: () => ({ selectedIds: [] }),
    getGraph: () => ({
      getNodes: () => ({
        find: () => ({ isVisible: () => true, getId: () => 'node-1' }),
      }),
    }),
    toModel: () => ({ graph: { visible: true } }),
  }),
  Node: class {},
  NodeModel: class {},
  Edge: class {},
  EdgeModel: class {},
}));

function Consumer() {
  const { toggleFullScreen, isFullScreen, toggleLegend, isLegendOpen } = useViewOptions();

  return (
    <div>
      <span data-testid="fullscreen-state">{String(isFullScreen)}</span>
      <span data-testid="legend-state">{String(isLegendOpen)}</span>
      <button type="button" onClick={toggleFullScreen}>
        Toggle fullscreen
      </button>
      <button type="button" onClick={toggleLegend}>
        Toggle legend
      </button>
    </div>
  );
}

describe('ViewOptionsProvider', () => {
  it('toggles fullscreen and legend state', async () => {
    const user = userEvent.setup();

    render(
      <ViewOptionsProvider>
        <Consumer />
      </ViewOptionsProvider>
    );

    expect(screen.getByTestId('fullscreen-state')).toHaveTextContent('false');
    expect(screen.getByTestId('legend-state')).toHaveTextContent('false');

    await user.click(screen.getByRole('button', { name: 'Toggle fullscreen' }));
    expect(screen.getByTestId('fullscreen-state')).toHaveTextContent('true');
    expect(screen.getByTestId('full-page-visualizer')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Toggle legend' }));
    expect(screen.getByTestId('legend-state')).toHaveTextContent('true');
  });

  it('exposes remove handlers from graph hook helpers', () => {
    const RemovalConsumer = () => {
      const { removeNodes } = useViewOptions();
      return (
        <button type="button" onClick={() => removeNodes([])}>
          Remove nodes
        </button>
      );
    };

    render(
      <ViewOptionsProvider>
        <RemovalConsumer />
      </ViewOptionsProvider>
    );

    expect(screen.getByRole('button', { name: 'Remove nodes' })).toBeInTheDocument();
    expect(mockRemoveNodes).toBeDefined();
    expect(mockRemoveLink).toBeDefined();
  });
});
