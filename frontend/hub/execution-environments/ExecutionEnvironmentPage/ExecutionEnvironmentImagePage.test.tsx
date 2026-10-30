/* eslint-disable i18next/no-literal-string */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  mockExecutionEnvironment,
  mockExecutionEnvironmentImage,
} from '../test/mockExecutionEnvironment';
import { ExecutionEnvironmentImagePage } from './ExecutionEnvironmentImagePage';

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn((url: string | undefined) => {
    if (url?.includes('execution-environments/repositories') && !url.includes('_content')) {
      return {
        data: mockExecutionEnvironment,
        isLoading: false,
        error: undefined,
        refresh: () => undefined,
      };
    }
    if (url?.includes('_content/images/')) {
      return {
        data: mockExecutionEnvironmentImage,
        isLoading: false,
        error: undefined,
        refresh: () => undefined,
      };
    }
    return { data: undefined, isLoading: true, error: undefined, refresh: () => undefined };
  }),
}));

import { useGet } from '@ansible/common-ui/crud/useGet';

describe('ExecutionEnvironmentImagePage', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => {
    server.resetHandlers();
    vi.mocked(useGet).mockImplementation((url: string | undefined) => {
      if (url?.includes('execution-environments/repositories') && !url.includes('_content')) {
        return {
          data: mockExecutionEnvironment,
          isLoading: false,
          error: undefined,
          refresh: () => undefined,
        };
      }
      if (url?.includes('_content/images/')) {
        return {
          data: mockExecutionEnvironmentImage,
          isLoading: false,
          error: undefined,
          refresh: () => undefined,
        };
      }
      return { data: undefined, isLoading: true, error: undefined, refresh: () => undefined };
    });
  });
  afterAll(() => server.close());

  it('renders image digest and tags in the page header', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          !request.url.includes('/_content/'),
        () => HttpResponse.json(mockExecutionEnvironment)
      ),
      http.get(
        ({ request }) =>
          request.url.includes('/_content/images/') && !request.url.endsWith('/_content/images/'),
        () => HttpResponse.json(mockExecutionEnvironmentImage)
      )
    );

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

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Image layers' })).toBeInTheDocument();
    });
    expect(screen.getByText(mockExecutionEnvironmentImage.digest)).toBeInTheDocument();
    expect(screen.getByText('latest')).toBeInTheDocument();
    expect(screen.getByText(/Size/i)).toBeInTheDocument();
  });

  it('shows loading page while image request is in flight', () => {
    vi.mocked(useGet).mockImplementation((url: string | undefined) => {
      if (url?.includes('execution-environments/repositories') && !url.includes('_content')) {
        return {
          data: mockExecutionEnvironment,
          isLoading: true,
          error: undefined,
          refresh: () => undefined,
        };
      }
      return { data: undefined, isLoading: true, error: undefined, refresh: () => undefined };
    });

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

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows hub error when execution environment request fails', () => {
    vi.mocked(useGet).mockImplementation((url: string | undefined) => {
      if (url?.includes('execution-environments/repositories') && !url.includes('_content')) {
        return {
          data: undefined,
          error: new Error('EE failed'),
          isLoading: false,
          refresh: () => undefined,
        };
      }
      return {
        data: mockExecutionEnvironmentImage,
        isLoading: false,
        error: undefined,
        refresh: () => undefined,
      };
    });

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

    expect(screen.getByText('EE failed')).toBeInTheDocument();
  });

  it('writes digest to clipboard from copy control', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

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

    await screen.findByRole('heading', { name: 'Image layers' });
    fireEvent.click(document.getElementById(mockExecutionEnvironmentImage.digest)!);
    expect(writeText).toHaveBeenCalledWith(mockExecutionEnvironmentImage.digest);
    writeText.mockRestore();
  });
});
