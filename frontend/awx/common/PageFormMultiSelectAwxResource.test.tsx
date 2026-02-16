/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageFormMultiSelectAwxResource } from './PageFormMultiSelectAwxResource';

type MockResource = { id: number; name: string; description?: string | null };

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/api/v2/projects/'),
    () =>
      HttpResponse.json({
        count: 2,
        results: [
          { id: 1, name: 'Project A', description: 'Desc A' },
          { id: 2, name: 'Project B' },
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

describe('PageFormMultiSelectAwxResource', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render label', async () => {
    render(
      <TestWrapper>
        <PageFormMultiSelectAwxResource<MockResource>
          name="projects"
          label="Projects"
          url="/api/v2/projects/"
          tableColumns={[{ header: 'Name', cell: (r) => r.name }]}
          placeholder="Select projects"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading"
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  it('should render placeholder', async () => {
    render(
      <TestWrapper>
        <PageFormMultiSelectAwxResource<MockResource>
          name="projects"
          label="Projects"
          url="/api/v2/projects/"
          tableColumns={[{ header: 'Name', cell: (r) => r.name }]}
          placeholder="Select projects"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading"
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select projects')).toBeInTheDocument();
    });
  });
});
