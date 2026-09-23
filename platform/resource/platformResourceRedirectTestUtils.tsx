import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ComponentType, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test } from 'vitest';

type MswTestServer = ReturnType<typeof setupServer>;

export type PlatformResourceRedirectTestConfig = {
  description: string;
  Component: ComponentType<{ route?: string }>;
  /**
   * Service API URLs from awxAPI / edaAPI / hubAPI helpers. Handlers match the request pathname
   * against each template pathname so MSW stays aligned with real client URLs.
   */
  apiUrls: string[];
  routePath: string;
  successResponse: object;
  notFoundResponse: object;
};

function pathnameFromApiUrl(apiUrl: string) {
  return new URL(apiUrl, 'https://test.local').pathname;
}

function matchesApiPath(request: Request, apiUrls: string[]) {
  const pathname = new URL(request.url).pathname;
  return apiUrls.some((apiUrl) => pathname === pathnameFromApiUrl(apiUrl));
}

export function registerPlatformResourceRedirectTests(
  server: MswTestServer,
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
          ({ request }) => matchesApiPath(request, config.apiUrls),
          () => new Promise(() => {})
        )
      );
      renderComponent();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('should render the error state when the request fails', async () => {
      server.use(
        http.get(
          ({ request }) => matchesApiPath(request, config.apiUrls),
          () => HttpResponse.json({ detail: 'boom' }, { status: 500 })
        )
      );
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Error' })).toBeInTheDocument();
      });
      expect(screen.getByText('An error occurred while loading the resource.')).toBeInTheDocument();
      expect(screen.queryByText('Navigated')).not.toBeInTheDocument();
    });

    test('should render the not-found state when the resource has no resource_type', async () => {
      server.use(
        http.get(
          ({ request }) => matchesApiPath(request, config.apiUrls),
          () => HttpResponse.json(config.notFoundResponse)
        )
      );
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Resource Not Found' })).toBeInTheDocument();
      });
    });

    test('should navigate to the resource route when the resource loads successfully', async () => {
      server.use(
        http.get(
          ({ request }) => matchesApiPath(request, config.apiUrls),
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
