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

function TestWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}) {
  const methods = useForm({ defaultValues });
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

  it('applies query params, search, and the next page cursor', async () => {
    const urls: string[] = [];
    server.use(
      http.get(
        ({ request }) => request.url.includes('/api/v2/projects/'),
        ({ request }) => {
          urls.push(request.url);
          const url = new URL(request.url);
          if (url.searchParams.get('name__icontains') === 'Proj') {
            return HttpResponse.json({
              count: 1,
              results: [{ id: 3, name: 'Project C', description: 'c' }],
            });
          }
          if (url.searchParams.has('name__gt')) {
            return HttpResponse.json({
              count: 1,
              results: [{ id: 4, name: 'Project D' }],
            });
          }
          return HttpResponse.json({
            count: 20,
            results: [
              { id: 1, name: 'Project A', description: 'Desc A' },
              { id: 2, name: 'Project B' },
            ],
          });
        }
      )
    );
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PageFormMultiSelectAwxResource<MockResource>
          name="projects"
          label="Projects"
          url="/api/v2/projects/?page_size=50&order_by=id&extra=keep"
          queryParams={{ foo: 'bar', tags: ['a', 'b'] }}
          tableColumns={[{ header: 'Name', cell: (resource) => resource.name }]}
          placeholder="Select projects"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading"
        />
      </TestWrapper>
    );

    await user.click(await screen.findByTestId('projects'));
    await waitFor(() => expect(urls.length).toBeGreaterThan(0));
    expect(urls[0]).toContain('page_size=10');
    expect(urls[0]).toContain('order_by=name');
    expect(urls[0]).toContain('extra=keep');
    expect(urls[0]).toContain('foo=bar');
    expect(urls[0]).toContain('tags=b');

    await user.click(await screen.findByRole('button', { name: 'Load more' }));
    await waitFor(() => expect(urls.some((url) => url.includes('name__gt='))).toBe(true));

    await user.type(screen.getByRole('textbox', { name: 'Search input' }), 'Proj');
    await waitFor(() =>
      expect(urls.some((url) => url.includes('name__icontains=Proj'))).toBe(true)
    );
    expect(await screen.findByText('Project C')).toBeInTheDocument();
  });

  it('returns no options when the resource request fails or the page is empty', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('/api/v2/projects/'),
        () => HttpResponse.json({}, { status: 500 })
      )
    );
    const user = userEvent.setup();
    const { unmount } = render(
      <TestWrapper>
        <PageFormMultiSelectAwxResource<MockResource>
          name="projects"
          label="Projects"
          url="/api/v2/projects/"
          tableColumns={[{ header: 'Name', cell: (resource) => resource.name }]}
          placeholder="Select projects"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading"
        />
      </TestWrapper>
    );
    await user.click(await screen.findByTestId('projects'));
    await waitFor(() => expect(screen.queryByText('Project A')).not.toBeInTheDocument());
    unmount();

    server.use(
      http.get(
        ({ request }) => request.url.includes('/api/v2/projects/'),
        () => HttpResponse.json({ count: 0, results: [] })
      )
    );
    render(
      <TestWrapper>
        <PageFormMultiSelectAwxResource<MockResource>
          name="projects"
          label="Projects"
          url="/api/v2/projects/"
          tableColumns={[{ header: 'Name', cell: (resource) => resource.name }]}
          placeholder="Select projects"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading"
        />
      </TestWrapper>
    );
    await user.click(await screen.findByTestId('projects'));
    await waitFor(() => expect(screen.queryByText('Project A')).not.toBeInTheDocument());
  });

  it('shows a stored name and loads a label when the value has only an id', async () => {
    server.use(
      http.get('/api/v2/projects/7/', () => HttpResponse.json({ id: 7, name: 'Fetched Project' }))
    );
    render(
      <TestWrapper defaultValues={{ projects: [{ id: 1, name: 'Named Project' }, { id: 7 }] }}>
        <PageFormMultiSelectAwxResource<MockResource>
          name="projects"
          label="Projects"
          url="/api/v2/projects/"
          tableColumns={[{ header: 'Name', cell: (resource) => resource.name }]}
          placeholder="Select projects"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading"
        />
      </TestWrapper>
    );

    expect(await screen.findByText('Named Project')).toBeInTheDocument();
    expect(await screen.findByText('Fetched Project')).toBeInTheDocument();
  });

  it('writes browsed resources back into the form', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper defaultValues={{ projects: [{ id: 1, name: 'Project A' }] }}>
        <PageFormMultiSelectAwxResource<MockResource>
          name="projects"
          label="Projects"
          url="/api/v2/projects/?extra=1"
          queryParams={{ kind: 'normal' }}
          tableColumns={[{ header: 'Name', cell: (resource) => resource.name }]}
          placeholder="Select projects"
          queryPlaceholder="Loading..."
          queryErrorText="Error loading"
          validate={() => Promise.resolve(undefined)}
          compareOptionValues={(left: MockResource, right: MockResource) => left.id === right.id}
        />
      </TestWrapper>
    );

    await user.click(await screen.findByTestId('projects'));
    await user.click(await screen.findByRole('button', { name: 'Browse' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const selectAll = await screen.findByRole('checkbox', { name: /select all/i });
    await user.click(selectAll);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('Project A')).toBeInTheDocument();
    expect(await screen.findByText('Project B')).toBeInTheDocument();
  });
});
