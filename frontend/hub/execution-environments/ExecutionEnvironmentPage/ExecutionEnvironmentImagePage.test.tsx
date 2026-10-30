/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  mockExecutionEnvironment,
  mockExecutionEnvironmentImage,
} from '../test/mockExecutionEnvironment';
import { ExecutionEnvironmentImagePage } from './ExecutionEnvironmentImagePage';

const isEERequest = ({ request }: { request: Request }) =>
  request.url.includes('/v3/plugin/execution-environments/repositories/') &&
  !request.url.includes('/_content/');

const isImageRequest = ({ request }: { request: Request }) =>
  request.url.includes('/_content/images/') && !request.url.endsWith('/_content/images/');

function renderPage() {
  render(
    <MemoryRouter
      initialEntries={['/execution-environments/test-execution-environment/images/latest/']}
    >
      <Routes>
        <Route
          path="/execution-environments/:id/images/:tag/"
          element={<ExecutionEnvironmentImagePage />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ExecutionEnvironmentImagePage', () => {
  const server = setupServer(
    http.get(isEERequest, () => HttpResponse.json(mockExecutionEnvironment)),
    http.get(isImageRequest, () => HttpResponse.json(mockExecutionEnvironmentImage))
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders image digest and tags in the page header', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Image layers' })).toBeInTheDocument();
    });
    expect(screen.getByText(mockExecutionEnvironmentImage.digest)).toBeInTheDocument();
    expect(screen.getByText('latest')).toBeInTheDocument();
    expect(screen.getByText(/Size/i)).toBeInTheDocument();
  });

  it('shows loading page while image request is in flight', async () => {
    server.use(
      http.get(isImageRequest, async () => {
        await delay('infinite');
        return HttpResponse.json(mockExecutionEnvironmentImage);
      })
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('shows hub error when execution environment request fails', async () => {
    server.use(
      http.get(isEERequest, () =>
        HttpResponse.json({ detail: 'EE failed' }, { status: 500, statusText: 'EE failed' })
      )
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('EE failed')).toBeInTheDocument();
    });
  });

  it('writes digest to clipboard from copy control', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    renderPage();

    await screen.findByRole('heading', { name: 'Image layers' });
    await user.click(screen.getByRole('button', { name: 'Copyable input' }));

    expect(writeText).toHaveBeenCalledWith(mockExecutionEnvironmentImage.digest);
    writeText.mockRestore();
  });
});
