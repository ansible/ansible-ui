import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { SetupServerApi } from 'msw/node';
import { ComponentType, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test } from 'vitest';

export type PlatformResourceRedirectTestConfig = {
  description: string;
  Component: ComponentType<{ route?: string }>;
  /** Unique path segment matched with `includes` against the request URL (e.g. `users/1`). */
  apiPathIncludes: string;
  routePath: string;
  successResponse: object;
  notFoundResponse: object;
};

function matchesApiPath(request: Request, apiPathIncludes: string) {
  return new URL(request.url).pathname.includes(apiPathIncludes);
}

export function registerPlatformResourceRedirectTests(
  server: SetupServerApi,
  config: PlatformResourceRedirectTestConfig
) {
  function wrapper({ children }: { children: ReactNode }) {
    const entryPath = `/${config.routePath.replace(':id', '1')}`;
    return (
      <MemoryRouter initialEntries={[entryPath]}>
        <Routes>
          <Route path={`/${config.routePath}`} element={children} />
          <Route path="/mock-resource-route" element={<div>Navigated</div>} />
        </Routes>
      </MemoryRouter>
    );
  }

  function renderComponent() {
    return render(<config.Component />, { wrapper });
  }

  describe(config.description, () => {
    test('should show a loading state while the request is pending', () => {
      server.use(
        http.get(
          ({ request }) => matchesApiPath(request, config.apiPathIncludes),
          () => new Promise(() => {})
        )
      );
      renderComponent();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('should render the error state when the request fails', async () => {
      server.use(
        http.get(
          ({ request }) => matchesApiPath(request, config.apiPathIncludes),
          () => HttpResponse.json({ detail: 'boom' }, { status: 500 })
        )
      );
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });
      expect(screen.getByText('An error occurred while loading the resource.')).toBeInTheDocument();
      expect(screen.queryByText('Navigated')).not.toBeInTheDocument();
    });

    test('should render the not-found state when the resource has no resource_type', async () => {
      server.use(
        http.get(
          ({ request }) => matchesApiPath(request, config.apiPathIncludes),
          () => HttpResponse.json(config.notFoundResponse)
        )
      );
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Resource Not Found')).toBeInTheDocument();
      });
    });

    test('should navigate to the resource route when the resource loads successfully', async () => {
      server.use(
        http.get(
          ({ request }) => matchesApiPath(request, config.apiPathIncludes),
          () => HttpResponse.json(config.successResponse)
        )
      );
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Navigated')).toBeInTheDocument();
      });
    });
  });
}
