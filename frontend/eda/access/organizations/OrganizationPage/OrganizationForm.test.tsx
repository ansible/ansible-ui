/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CreateOrganization, EditOrganization } from './OrganizationForm';

const mockOrganization = {
  id: 3,
  name: 'Existing Org',
  description: 'An existing organization',
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
};

const server = setupServer(
  http.get('*/organizations/3/', () => HttpResponse.json(mockOrganization)),
  http.post('*/organizations/', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 10, ...(body as object) }, { status: 201 });
  }),
  http.patch('*/organizations/3/', async ({ request }) => {
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

    it('should not submit when name is empty', async () => {
      const postSpy = vi.fn();
      server.use(
        http.post('*/organizations/', async ({ request }) => {
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
        http.post('*/organizations/', () =>
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

    it('should render loading state before organization data loads', async () => {
      server.use(http.get('*/organizations/3/', () => new HttpResponse(null, { status: 200 })));

      render(
        <MemoryRouter initialEntries={['/organizations/3/edit']}>
          <Routes>
            <Route path="/organizations/:id/edit" element={<EditOrganization />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Organization', level: 1 })).toBeInTheDocument();
      });
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
