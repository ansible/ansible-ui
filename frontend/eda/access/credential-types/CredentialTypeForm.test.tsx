/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => {
  const FakeDataEditor = vi.fn((props: Record<string, string | (() => void)>) => (
    <textarea
      id={props.id as string}
      name={props.id as string}
      value={props.value as string}
      onChange={props.onChange as () => void}
      data-testid={props.id as string}
    />
  ));
  return { DataEditor: FakeDataEditor };
});

import { edaAPI } from '../../common/eda-utils';
import { CreateCredentialType, EditCredentialType } from './CredentialTypeForm';

const mockCredentialType = {
  id: 10,
  name: 'My Credential Type',
  description: 'Test description',
  namespace: null,
  kind: 'cloud',
  managed: false,
  inputs: { fields: [{ id: 'username', label: 'Username', type: 'string' }] },
  injectors: {},
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
};

const server = setupServer(
  http.get(edaAPI`/credential-types/10/`, () => HttpResponse.json(mockCredentialType)),
  http.options(edaAPI`/credential-types/10/`, () => HttpResponse.json({ actions: { PATCH: {} } })),
  http.post(edaAPI`/credential-types/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 20, ...(body as object) }, { status: 201 });
  }),
  http.patch(edaAPI`/credential-types/10/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockCredentialType, ...(body as object) });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CreateCredentialType', () => {
  it('should render create page with title and breadcrumbs', async () => {
    render(
      <MemoryRouter>
        <CreateCredentialType />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Create credential type', level: 1 })
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Credential Types')).toBeInTheDocument();
  });

  it('should render form fields', async () => {
    render(
      <MemoryRouter>
        <CreateCredentialType />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /^name$/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
    expect(screen.getByText('Input configuration')).toBeInTheDocument();
    expect(screen.getByText('Injector configuration')).toBeInTheDocument();
  });

  it('should not submit when name is empty', async () => {
    const postSpy = vi.fn();
    server.use(
      http.post(edaAPI`/credential-types/`, async ({ request }) => {
        postSpy(await request.json());
        return HttpResponse.json({ id: 1 }, { status: 201 });
      })
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreateCredentialType />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Create credential type', level: 1 })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('Submit'));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Create credential type', level: 1 })
      ).toBeInTheDocument();
    });

    expect(postSpy).not.toHaveBeenCalled();
  });

  it('should display error when API returns 500', async () => {
    server.use(
      http.post(edaAPI`/credential-types/`, () =>
        HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
      )
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreateCredentialType />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /^name$/i })).toBeInTheDocument();
    });

    await user.type(screen.getByRole('textbox', { name: /^name$/i }), 'New Type');
    await user.click(screen.getByTestId('Submit'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

describe('EditCredentialType', () => {
  it('should render edit page with credential type name in title', async () => {
    render(
      <MemoryRouter initialEntries={['/credential-types/10/edit']}>
        <Routes>
          <Route path="/credential-types/:id/edit" element={<EditCredentialType />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /edit my credential type/i, level: 1 })
      ).toBeInTheDocument();
    });
  });

  it('should render form fields with populated data', async () => {
    render(
      <MemoryRouter initialEntries={['/credential-types/10/edit']}>
        <Routes>
          <Route path="/credential-types/:id/edit" element={<EditCredentialType />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /^name$/i })).toHaveValue('My Credential Type');
    });

    expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue('Test description');
  });

  it('should display breadcrumbs', async () => {
    render(
      <MemoryRouter initialEntries={['/credential-types/10/edit']}>
        <Routes>
          <Route path="/credential-types/:id/edit" element={<EditCredentialType />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Credential Types')).toBeInTheDocument();
    });
  });

  it('should show warning when user lacks PATCH permission', async () => {
    server.use(
      http.options(edaAPI`/credential-types/10/`, () => HttpResponse.json({ actions: {} }))
    );

    render(
      <MemoryRouter initialEntries={['/credential-types/10/edit']}>
        <Routes>
          <Route path="/credential-types/:id/edit" element={<EditCredentialType />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/you do not have permissions to edit this credential type/i)
      ).toBeInTheDocument();
    });
  });

  it('should render loading state before credential type loads', () => {
    server.use(
      http.get(edaAPI`/credential-types/10/`, async () => {
        await new Promise((r) => setTimeout(r, 5000));
        return HttpResponse.json(mockCredentialType);
      }),
      http.options(edaAPI`/credential-types/10/`, () =>
        HttpResponse.json({ actions: { PATCH: {} } })
      )
    );

    render(
      <MemoryRouter initialEntries={['/credential-types/10/edit']}>
        <Routes>
          <Route path="/credential-types/:id/edit" element={<EditCredentialType />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Credential Type', level: 1 })).toBeInTheDocument();
  });
});
