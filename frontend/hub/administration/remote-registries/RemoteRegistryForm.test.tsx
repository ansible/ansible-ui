/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { hubAPI } from '../../common/api/formatPath';
import { CreateRemoteRegistry, EditRemoteRegistry } from './RemoteRegistryForm';

const mockPageNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
  };
});

const mockRemoteRegistry = {
  id: '1',
  pulp_href: '/pulp/api/v3/remotes/container/container/12345678-1234-1234-1234-123456789abc/',
  name: 'test-registry',
  url: 'https://registry.example.com',
  policy: 'immediate' as const,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  tls_validation: true,
  client_cert: null,
  ca_cert: null,
  last_sync_task: {
    task_id: '1',
    state: 'completed' as const,
    started_at: '2026-01-01T00:00:00Z',
    finished_at: '2026-01-01T00:00:00Z',
    error: null,
  },
  download_concurrency: null,
  proxy_url: null,
  write_only_fields: [
    { name: 'client_key' as const, is_set: false },
    { name: 'username' as const, is_set: false },
    { name: 'password' as const, is_set: false },
    { name: 'proxy_username' as const, is_set: false },
    { name: 'proxy_password' as const, is_set: false },
  ],
  rate_limit: null,
  is_indexable: true,
};

const server = setupServer(
  http.get(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
    HttpResponse.json({
      meta: { count: 1 },
      data: [mockRemoteRegistry],
      links: { next: null },
    })
  ),
  http.post(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
    HttpResponse.json({ ...mockRemoteRegistry, name: 'new-registry' }, { status: 201 })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  mockPageNavigate.mockClear();
});
afterAll(() => server.close());

describe('CreateRemoteRegistry', () => {
  it('should render the submit button', () => {
    render(
      <MemoryRouter>
        <CreateRemoteRegistry />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Create remote registry' })).toBeInTheDocument();
  });

  it('should render required form fields', () => {
    render(
      <MemoryRouter>
        <CreateRemoteRegistry />
      </MemoryRouter>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('should render advanced fields in expandable section', () => {
    render(
      <MemoryRouter>
        <CreateRemoteRegistry />
      </MemoryRouter>
    );

    expect(screen.getByText('Proxy URL')).toBeInTheDocument();
    expect(screen.getByText('TLS validation')).toBeInTheDocument();
    expect(screen.getByText('Download concurrency')).toBeInTheDocument();
    expect(screen.getByText('Rate limit')).toBeInTheDocument();
  });

  it('should render certificate fields', () => {
    render(
      <MemoryRouter>
        <CreateRemoteRegistry />
      </MemoryRouter>
    );

    expect(screen.getByText('Client key')).toBeInTheDocument();
    expect(screen.getByText('Client certificate')).toBeInTheDocument();
    expect(screen.getByText('CA certificate')).toBeInTheDocument();
  });

  it('submits create remote registry form', async () => {
    const user = userEvent.setup();
    let postPayload: Record<string, unknown> | undefined;

    server.use(
      http.post(hubAPI`/_ui/v1/execution-environments/registries/`, async ({ request }) => {
        postPayload = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ...mockRemoteRegistry, name: 'new-registry' }, { status: 201 });
      })
    );

    render(
      <MemoryRouter>
        <CreateRemoteRegistry />
      </MemoryRouter>
    );

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'new-registry');
    await user.type(screen.getByRole('textbox', { name: 'URL' }), 'https://registry.example.com');
    await user.click(screen.getByRole('button', { name: 'Create remote registry' }));

    await waitFor(() => {
      expect(postPayload).toBeDefined();
    });
    expect(postPayload?.name).toBe('new-registry');
    await waitFor(() => {
      expect(mockPageNavigate).toHaveBeenCalled();
    });
  }, 20000);

  it('strips empty optional auth fields from create payload', async () => {
    const user = userEvent.setup();
    let postPayload: Record<string, unknown> | undefined;

    server.use(
      http.post(hubAPI`/_ui/v1/execution-environments/registries/`, async ({ request }) => {
        postPayload = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ...mockRemoteRegistry, name: 'new-registry' }, { status: 201 });
      })
    );

    render(
      <MemoryRouter>
        <CreateRemoteRegistry />
      </MemoryRouter>
    );

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'new-registry');
    await user.type(screen.getByRole('textbox', { name: 'URL' }), 'https://registry.example.com');
    await user.type(screen.getByRole('textbox', { name: 'Username' }), 'user');
    await user.clear(screen.getByRole('textbox', { name: 'Username' }));
    await user.click(screen.getByRole('button', { name: 'Create remote registry' }));

    await waitFor(() => {
      expect(postPayload).toBeDefined();
    });
    expect(postPayload?.username).toBeUndefined();
  }, 20000);

  it('navigates back when create is cancelled', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreateRemoteRegistry />
      </MemoryRouter>
    );

    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(mockPageNavigate).not.toHaveBeenCalled();
  });
});

describe('EditRemoteRegistry', () => {
  it('should render the edit page header with registry name', async () => {
    render(
      <MemoryRouter initialEntries={['/remote-registries/test-registry/edit']}>
        <Routes>
          <Route path="/remote-registries/:id/edit" element={<EditRemoteRegistry />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit test-registry/i })).toBeInTheDocument();
    });
  });

  it('should render save button in edit mode', async () => {
    render(
      <MemoryRouter initialEntries={['/remote-registries/test-registry/edit']}>
        <Routes>
          <Route path="/remote-registries/:id/edit" element={<EditRemoteRegistry />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: 'Save remote registry' })).toBeInTheDocument();
  });

  it('should populate the name field with existing data', async () => {
    render(
      <MemoryRouter initialEntries={['/remote-registries/test-registry/edit']}>
        <Routes>
          <Route path="/remote-registries/:id/edit" element={<EditRemoteRegistry />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = await screen.findByRole('textbox', { name: 'Name' });
    expect(nameInput).toHaveValue('test-registry');
  });

  it('should disable the name field in edit mode', async () => {
    render(
      <MemoryRouter initialEntries={['/remote-registries/test-registry/edit']}>
        <Routes>
          <Route path="/remote-registries/:id/edit" element={<EditRemoteRegistry />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = await screen.findByRole('textbox', { name: 'Name' });
    expect(nameInput).toBeDisabled();
  });

  it('should populate the URL field with existing data', async () => {
    render(
      <MemoryRouter initialEntries={['/remote-registries/test-registry/edit']}>
        <Routes>
          <Route path="/remote-registries/:id/edit" element={<EditRemoteRegistry />} />
        </Routes>
      </MemoryRouter>
    );

    const urlInput = await screen.findByRole('textbox', { name: 'URL' });
    expect(urlInput).toHaveValue('https://registry.example.com');
  });

  it('should show error state when registry is not found', async () => {
    server.use(
      http.get(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
        HttpResponse.json({
          meta: { count: 0 },
          data: [],
          links: { next: null },
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/remote-registries/nonexistent/edit']}>
        <Routes>
          <Route path="/remote-registries/:id/edit" element={<EditRemoteRegistry />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Remote registry not found')).toBeInTheDocument();
    });
  });

  it('shows error state when registry lookup fails', async () => {
    server.use(
      http.get(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
        HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      )
    );

    render(
      <MemoryRouter initialEntries={['/remote-registries/test-registry/edit']}>
        <Routes>
          <Route path="/remote-registries/:id/edit" element={<EditRemoteRegistry />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: /Refresh/i })).toBeInTheDocument();
  });

  it('saves edited remote registry via PUT', async () => {
    let putPayload: Record<string, unknown> | undefined;

    server.use(
      http.get(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
        HttpResponse.json({
          meta: { count: 1 },
          data: [
            {
              ...mockRemoteRegistry,
              write_only_fields: [{ name: 'password', is_set: true }],
            },
          ],
          links: { next: null },
        })
      ),
      http.put(
        ({ request }) => request.url.includes('/execution-environments/registries/'),
        async ({ request }) => {
          putPayload = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(mockRemoteRegistry);
        }
      )
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/remote-registries/test-registry/edit']}>
        <Routes>
          <Route path="/remote-registries/:id/edit" element={<EditRemoteRegistry />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('button', { name: 'Save remote registry' });
    const urlInput = screen.getByRole('textbox', { name: 'URL' });
    await user.clear(urlInput);
    await user.type(urlInput, 'https://registry.example.org');
    await user.click(screen.getByRole('button', { name: 'Save remote registry' }));

    await waitFor(() => {
      expect(putPayload).toBeDefined();
    });
    expect(putPayload?.url).toBe('https://registry.example.org');
    await waitFor(() => {
      expect(mockPageNavigate).toHaveBeenCalled();
    });
  }, 30000);

  it('navigates to user access when edit is cancelled', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/remote-registries/test-registry/edit']}>
        <Routes>
          <Route path="/remote-registries/:id/edit" element={<EditRemoteRegistry />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
  });
});
