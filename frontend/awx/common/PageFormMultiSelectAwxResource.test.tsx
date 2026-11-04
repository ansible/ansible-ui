/* eslint-disable i18next/no-literal-string */
import { PageDialogProvider } from '@ansible/ansible-ui-framework';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      <PageDialogProvider>
        <FormProvider {...methods}>{children}</FormProvider>
      </PageDialogProvider>
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

  it('loads project options when the select is opened', async () => {
    const user = userEvent.setup();
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
      expect(screen.getByTestId('projects')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('projects'));

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });
  });

  it('opens browse dialog to select resources', async () => {
    const user = userEvent.setup();
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
      expect(screen.getByTestId('projects')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('projects'));
    await user.click(screen.getByRole('button', { name: 'Browse' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('uses formatLabel when formatting async options', async () => {
    const user = userEvent.setup();
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
          formatLabel={(resource) => `Label ${resource.name}`}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('projects')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('projects'));

    await waitFor(() => {
      expect(screen.getByText('Label Project A')).toBeInTheDocument();
    });
  });
});
