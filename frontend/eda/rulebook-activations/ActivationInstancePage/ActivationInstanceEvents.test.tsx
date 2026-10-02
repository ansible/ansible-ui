import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ActivationInstanceEvents } from './ActivationInstanceEvents';

vi.mock('@react-hook/resize-observer', () => ({
  default: vi.fn(),
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn(() => ({ data: undefined })),
}));

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: vi.fn(() => Promise.resolve({ count: 0, results: [] })),
}));

describe('ActivationInstanceEvents', () => {
  it('should render with scroll controls wired to virtualized list', () => {
    render(
      <MemoryRouter initialEntries={['/activations/instances/1']}>
        <Routes>
          <Route
            path="/activations/instances/:instanceId"
            element={
              <ActivationInstanceEvents
                toolbarFilters={[]}
                filterState={{}}
                isFollowModeEnabled={false}
                setIsFollowModeEnabled={vi.fn()}
                isRunning={false}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Scroll first' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scroll last' })).toBeInTheDocument();
  });
});
