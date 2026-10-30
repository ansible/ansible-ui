/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  mockExecutionEnvironment,
  mockExecutionEnvironmentImage,
} from '../test/mockExecutionEnvironment';
import { ExecutionEnvironmentImages } from './ExecutionEnvironmentImages';

const mockImagesResponse = {
  meta: { count: 1 },
  data: [mockExecutionEnvironmentImage],
  links: {},
};

describe('ExecutionEnvironmentImages', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders images from the API', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          request.url.includes('/_content/images/'),
        () => HttpResponse.json(mockImagesResponse)
      )
    );

    render(
      <MemoryRouter initialEntries={['/execution-environments/test-execution-environment/images']}>
        <Routes>
          <Route
            path="/execution-environments/:id/images"
            element={<Outlet context={{ executionEnvironment: mockExecutionEnvironment }} />}
          >
            <Route index element={<ExecutionEnvironmentImages />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('latest')).toBeInTheDocument();
    });
  });

  it('renders expanded manifest list rows', async () => {
    const manifestListImage = {
      ...mockExecutionEnvironmentImage,
      media_type: 'application/vnd.docker.distribution.manifest.list.v2+json',
      image_manifests: [
        {
          digest: 'sha256:child1',
          os: 'linux',
          architecture: 'amd64',
          variant: '',
        },
      ],
    };

    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          request.url.includes('/_content/images/'),
        () =>
          HttpResponse.json({
            meta: { count: 1 },
            data: [manifestListImage],
            links: {},
          })
      )
    );

    render(
      <MemoryRouter initialEntries={['/execution-environments/test-execution-environment/images']}>
        <Routes>
          <Route
            path="/execution-environments/:id/images"
            element={<Outlet context={{ executionEnvironment: mockExecutionEnvironment }} />}
          >
            <Route index element={<ExecutionEnvironmentImages />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('latest')).toBeInTheDocument();
    });

    const expandButtons = screen.getAllByRole('button', { name: /Details/i });
    await userEvent.setup().click(expandButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('linux / amd64')).toBeInTheDocument();
    });
  });
});
