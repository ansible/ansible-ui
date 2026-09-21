/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { CreateOrganization, EditOrganization } from './OrganizationForm';

const mockOrganization = {
  id: 3,
  name: 'Existing Org',
  description: 'An existing organization',
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
};

const server = setupServer(
  http.options(edaAPI`/organizations/`, () =>
    HttpResponse.json({
      actions: {
        POST: {
          name: { type: 'string', required: true },
          description: { type: 'string', required: false },
        },
      },
    })
  ),
  http.options(edaAPI`/organizations/3/`, () =>
    HttpResponse.json({ actions: { PATCH: { name: { type: 'string' } } } })
  ),
  http.get(edaAPI`/organizations/3/`, () => HttpResponse.json(mockOrganization)),
  http.post(edaAPI`/organizations/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 10, ...(body as object) }, { status: 201 });
  }),
  http.patch(edaAPI`/organizations/3/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockOrganization, ...(body as object) });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('OrganizationForm', () => {
  describe('CreateOrganization', () => {
    it('should render create organization page with title and Name field', async () => {
      render(
        <MemoryRouter>
          <CreateOrganization />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create organization');
      });

      expect(screen.getByTestId('name-form-group')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
    });

    it('should display breadcrumbs', async () => {
      render(
        <MemoryRouter>
          <CreateOrganization />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Organizations')).toBeInTheDocument();
      });
    });

    it('should apply name pattern validation from OPTIONS metadata', async () => {
      server.use(
        http.options(edaAPI`/organizations/`, () =>
          HttpResponse.json({
            actions: {
              POST: {
                name: {
                  pattern: '^[a-zA-Z0-9_-]+$',
                  pattern_description: 'Letters, numbers, underscores, and hyphens only',
                },
              },
            },
          })
        )
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CreateOrganization />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      });

      await user.type(screen.getByRole('textbox', { name: /name/i }), 'bad@name');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('Letters, numbers, underscores, and hyphens only')
        ).toBeInTheDocument();
      });
    });

    it('should not submit when name is empty', async () => {
      const postSpy = vi.fn();
      server.use(
        http.post(edaAPI`/organizations/`, async ({ request }) => {
          postSpy(await request.json());
          return HttpResponse.json({ id: 1 }, { status: 201 });
        })
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CreateOrganization />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create organization');
      });

      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create organization');
      });

      expect(postSpy).not.toHaveBeenCalled();
    });

    it('should display error on API failure', async () => {
      server.use(
        http.post(edaAPI`/organizations/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CreateOrganization />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      });

      await user.type(screen.getByRole('textbox', { name: /name/i }), 'New Org');
      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('EditOrganization', () => {
    it('should render edit page with populated data', async () => {
      render(
        <MemoryRouter initialEntries={['/organizations/3/edit']}>
          <Routes>
            <Route path="/organizations/:id/edit" element={<EditOrganization />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /edit existing org/i, level: 1 })
        ).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Existing Org');
      expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue(
        'An existing organization'
      );
    });

    it('should display breadcrumbs with Organizations link', async () => {
      render(
        <MemoryRouter initialEntries={['/organizations/3/edit']}>
          <Routes>
            <Route path="/organizations/:id/edit" element={<EditOrganization />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Organizations')).toBeInTheDocument();
      });
    });
  });
});
