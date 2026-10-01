/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageFormSingleSelectAwxResource } from './PageFormSingleSelectAwxResource';

type MockResource = { id: number; name: string; description?: string | null };

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/api/v2/inventories/'),
    () =>
      HttpResponse.json({
        count: 2,
        results: [
          { id: 1, name: 'Inventory A', description: 'Desc A' },
          { id: 2, name: 'Inventory B' },
        ],
        next: null,
      })
  )
);

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm();
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormSingleSelectAwxResource', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render label', async () => {
    render(
      <TestWrapper>
        <PageFormSingleSelectAwxResource<MockResource>
          name="inventory"
          label="Inventory"
          url="/api/v2/inventories/"
          tableColumns={[{ header: 'Name', cell: (r) => r.name }]}
          placeholder="Select inventory"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading"
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Inventory')).toBeInTheDocument();
    });
  });

  it('should render placeholder', async () => {
    render(
      <TestWrapper>
        <PageFormSingleSelectAwxResource<MockResource>
          name="inventory"
          label="Inventory"
          url="/api/v2/inventories/"
          tableColumns={[{ header: 'Name', cell: (r) => r.name }]}
          placeholder="Select inventory"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading"
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select inventory')).toBeInTheDocument();
    });
  });

  it('should show query error when the list request fails', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        ({ request }) => request.url.includes('/api/v2/inventories/'),
        () => new HttpResponse(null, { status: 403 })
      )
    );

    render(
      <TestWrapper>
        <PageFormSingleSelectAwxResource<MockResource>
          name="inventory"
          label="Inventory"
          url="/api/v2/inventories/"
          tableColumns={[{ header: 'Name', cell: (r) => r.name }]}
          placeholder="Select inventory"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading inventories"
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('inventory')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('inventory'));

    await waitFor(() => {
      expect(screen.getByText('Error loading inventories')).toBeInTheDocument();
    });
  });

  it('should show custom empty message when the list returns no results', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        ({ request }) => request.url.includes('/api/v2/inventories/'),
        () =>
          HttpResponse.json({
            count: 0,
            results: [],
          })
      )
    );

    render(
      <TestWrapper>
        <PageFormSingleSelectAwxResource<MockResource>
          name="inventory"
          label="Inventory"
          url="/api/v2/inventories/"
          tableColumns={[{ header: 'Name', cell: (r) => r.name }]}
          placeholder="Select inventory"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading inventories"
          noResultsMessage="No options currently available."
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('inventory')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('inventory'));

    await waitFor(() => {
      expect(screen.getByText('No options currently available.')).toBeInTheDocument();
    });
  });

  it('should omit browse when enableBrowse is false', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <PageFormSingleSelectAwxResource<MockResource>
          name="inventory"
          label="Inventory"
          url="/api/v2/inventories/"
          tableColumns={[{ header: 'Name', cell: (r) => r.name }]}
          placeholder="Select inventory"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading inventories"
          enableBrowse={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('inventory')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('inventory'));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Browse' })).not.toBeInTheDocument();
    });
  });

  it('should append array queryParams to list requests', async () => {
    const user = userEvent.setup();
    const requestUrls: string[] = [];
    server.use(
      http.get(
        ({ request }) => request.url.includes('/api/v2/inventories/'),
        ({ request }) => {
          requestUrls.push(request.url);
          return HttpResponse.json({
            count: 0,
            results: [],
          });
        }
      )
    );

    render(
      <TestWrapper>
        <PageFormSingleSelectAwxResource<MockResource>
          name="inventory"
          label="Inventory"
          url="/api/v2/inventories/"
          queryParams={{ organization: ['1', '2'] }}
          tableColumns={[{ header: 'Name', cell: (r) => r.name }]}
          placeholder="Select inventory"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading inventories"
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('inventory')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('inventory'));

    await waitFor(() => {
      expect(requestUrls.length).toBeGreaterThan(0);
    });

    const params = new URL(requestUrls[0]).searchParams;
    expect(params.getAll('organization')).toEqual(['1', '2']);
  });
});
