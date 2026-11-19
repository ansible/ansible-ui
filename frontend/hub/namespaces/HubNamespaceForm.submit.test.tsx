import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { HubNamespace } from './HubNamespace';
import { CreateHubNamespace, EditHubNamespace } from './HubNamespaceForm';

const pageNavigate = vi.hoisted(() => vi.fn());

vi.mock('../common/isInsights', () => ({
  isInsightsMode: () => false,
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
  };
});

vi.mock('../common/HubPageForm', () => ({
  HubPageForm: ({
    onSubmit,
    onCancel,
    submitText,
    defaultValue,
  }: {
    onSubmit: (namespace: HubNamespace) => Promise<void>;
    onCancel: () => void;
    submitText: string;
    defaultValue?: Partial<HubNamespace>;
  }) => (
    <div>
      <div data-testid="default-links">{JSON.stringify(defaultValue?.links ?? null)}</div>
      <button type="button" onClick={() => void onSubmit(defaultValue as HubNamespace)}>
        {submitText}
      </button>
      <button
        type="button"
        onClick={() =>
          void onSubmit({
            name: 'kept-links',
            links: [{ name: 'Docs', url: 'https://example.com' }],
          } as HubNamespace)
        }
      >
        Submit kept links
      </button>
      <button
        type="button"
        onClick={() => void onSubmit({ name: 'many-links', links: [] } as unknown as HubNamespace)}
      >
        Submit empty list
      </button>
      <button type="button" onClick={() => void onSubmit({ name: 'no-links' } as HubNamespace)}>
        Submit without links
      </button>
      <button type="button" onClick={onCancel}>
        Cancel form
      </button>
    </div>
  ),
}));

vi.mock('./UsefulLinksFields', () => ({
  UsefulLinksFields: () => null,
}));

vi.mock('./components/HubNamespaceErrorAdapter', () => ({
  HubNamespaceErrorAdapter: () => null,
}));

const server = setupServer(
  http.options('*/_ui/v1/namespaces/', () => HttpResponse.json({ actions: { POST: {} } })),
  http.post('*/_ui/v1/namespaces/', async ({ request }) => {
    const body = (await request.json()) as HubNamespace;
    return HttpResponse.json({ ...body, name: body.name === 'fallback' ? undefined : 'from-api' });
  }),
  http.get('*/_ui/v1/my-namespaces/existing-namespace/', () =>
    HttpResponse.json({
      name: 'existing-namespace',
      description: '',
      company: '',
      avatar_url: '',
      links: [{ name: '', url: '' }],
      resources: '',
    })
  ),
  http.put('*/_ui/v1/my-namespaces/existing-namespace/', async ({ request }) => {
    const body = (await request.json()) as HubNamespace;
    return HttpResponse.json(body);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  pageNavigate.mockClear();
});
afterAll(() => server.close());

describe('HubNamespaceForm submit', () => {
  it('clears a single empty link, keeps real links, and navigates to the created name', async () => {
    const user = userEvent.setup();
    let posted: HubNamespace | undefined;
    server.use(
      http.post('*/_ui/v1/namespaces/', async ({ request }) => {
        posted = (await request.json()) as HubNamespace;
        return HttpResponse.json({ name: posted.name === 'fallback' ? null : 'from-api' });
      })
    );

    render(
      <MemoryRouter initialEntries={['/namespaces', '/namespaces/create']} initialIndex={1}>
        <Routes>
          <Route path="/namespaces" element={<div>namespace list</div>} />
          <Route path="/namespaces/create" element={<CreateHubNamespace />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Create namespace' }));
    await waitFor(() => expect(posted?.links).toEqual([]));
    expect(pageNavigate).toHaveBeenCalledWith('hub-namespace-page', {
      params: { id: 'from-api' },
    });

    pageNavigate.mockClear();
    await user.click(screen.getByRole('button', { name: 'Submit kept links' }));
    await waitFor(() =>
      expect(posted?.links).toEqual([{ name: 'Docs', url: 'https://example.com' }])
    );

    await user.click(screen.getByRole('button', { name: 'Submit empty list' }));
    await waitFor(() => expect(posted?.links).toEqual([]));

    await user.click(screen.getByRole('button', { name: 'Submit without links' }));
    await waitFor(() => expect(posted?.name).toBe('no-links'));

    server.use(http.post('*/_ui/v1/namespaces/', () => HttpResponse.json({})));
    await user.click(screen.getByRole('button', { name: 'Submit kept links' }));
    await waitFor(() =>
      expect(pageNavigate).toHaveBeenCalledWith('hub-namespace-page', {
        params: { id: 'kept-links' },
      })
    );

    await user.click(screen.getByRole('button', { name: 'Cancel form' }));
    expect(screen.getByText('namespace list')).toBeInTheDocument();
  });

  it('clears an empty link when an edited namespace is saved', async () => {
    const user = userEvent.setup();
    let posted: HubNamespace | undefined;
    server.use(
      http.put('*/_ui/v1/my-namespaces/existing-namespace/', async ({ request }) => {
        posted = (await request.json()) as HubNamespace;
        return HttpResponse.json(posted);
      })
    );

    render(
      <MemoryRouter
        initialEntries={['/namespaces', '/namespaces/existing-namespace/edit']}
        initialIndex={1}
      >
        <Routes>
          <Route path="/namespaces" element={<div>namespace list</div>} />
          <Route path="/namespaces/:id/edit" element={<EditHubNamespace />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByTestId('default-links')).toHaveTextContent(
      JSON.stringify([{ name: '', url: '' }])
    );

    await user.click(screen.getByRole('button', { name: 'Save namespace' }));
    await waitFor(() => expect(posted?.links).toEqual([]));
    expect(screen.getByText('namespace list')).toBeInTheDocument();
  });

  it('keeps populated links when an edited namespace is saved', async () => {
    const user = userEvent.setup();
    let posted: HubNamespace | undefined;
    server.use(
      http.put('*/_ui/v1/my-namespaces/existing-namespace/', async ({ request }) => {
        posted = (await request.json()) as HubNamespace;
        return HttpResponse.json(posted);
      })
    );

    render(
      <MemoryRouter initialEntries={['/namespaces/existing-namespace/edit']}>
        <Routes>
          <Route path="/namespaces/:id/edit" element={<EditHubNamespace />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('button', { name: 'Submit kept links' });
    await user.click(screen.getByRole('button', { name: 'Submit kept links' }));
    await waitFor(() =>
      expect(posted?.links).toEqual([{ name: 'Docs', url: 'https://example.com' }])
    );
  });
});
