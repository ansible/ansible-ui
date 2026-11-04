/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { mockExecutionEnvironmentImage } from '../test/mockExecutionEnvironment';
import { ExecutionEnvironmentImageDetails } from './ExecutionEnvironmentImageDetails';

describe('ExecutionEnvironmentImageDetails', () => {
  it('renders layer list and command for an image', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/execution-environments/test-ee/images/sha256:abc']}>
        <Routes>
          <Route
            path="/execution-environments/:id/images/:tag"
            element={
              <Outlet context={{ image: mockExecutionEnvironmentImage, imageError: undefined }} />
            }
          >
            <Route index element={<ExecutionEnvironmentImageDetails />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getAllByText('CMD ["sh"]').length).toBeGreaterThan(0);
    expect(screen.getByText('PATH=/usr/local/bin')).toBeInTheDocument();

    await user.click(screen.getAllByText('CMD ["sh"]')[0]!);
    expect(screen.getByRole('heading', { name: 'Command' })).toBeInTheDocument();
  });

  it('shows manifest list unsupported message when image is missing', () => {
    render(
      <MemoryRouter initialEntries={['/execution-environments/test-ee/images/sha256:abc']}>
        <Routes>
          <Route
            path="/execution-environments/:id/images/:tag"
            element={
              <Outlet context={{ image: undefined, imageError: new Error('unsupported') }} />
            }
          >
            <Route index element={<ExecutionEnvironmentImageDetails />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Manifest lists are not currently supported on this screen/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Images' })).toBeInTheDocument();
  });
});
