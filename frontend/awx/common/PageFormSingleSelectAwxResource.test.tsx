/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
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
});
