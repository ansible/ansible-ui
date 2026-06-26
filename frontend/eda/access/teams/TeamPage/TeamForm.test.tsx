import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { CreateTeam } from './TeamForm';

const mockOrganizations = {
  count: 2,
  results: [
    { id: 1, name: 'Default' },
    { id: 2, name: 'Organization 1' },
  ],
};

const server = setupServer(
  http.options(edaAPI`/organizations/`, () => {
    return HttpResponse.json({ actions: { GET: {} } });
  }),
  http.get(edaAPI`/organizations/`, () => {
    return HttpResponse.json(mockOrganizations);
  }),
  http.post(edaAPI`/teams/`, () => {
    return HttpResponse.json({ id: 1, name: 'Test Team', organization_id: 1 }, { status: 201 });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TeamForm', () => {
  describe('CreateTeam', () => {
    it('should render create team form', async () => {
      render(
        <MemoryRouter>
          <CreateTeam />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Create team', level: 1 })).toBeInTheDocument();
      });
    });

    it('should display form fields', async () => {
      render(
        <MemoryRouter>
          <CreateTeam />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByText('Organization')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should not submit the form when required fields are empty', async () => {
      const postSpy = vi.fn();
      server.use(
        http.post(edaAPI`/teams/`, async ({ request }) => {
          postSpy(await request.json());
          return HttpResponse.json({ id: 1 }, { status: 201 });
        })
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CreateTeam />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Create team', level: 1 })).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Create team', level: 1 })).toBeInTheDocument();
      });

      expect(postSpy).not.toHaveBeenCalled();
    });

    it(
      'should display error alert when server returns 500 on submit',
      { timeout: 15000 },
      async () => {
        server.use(
          http.post(edaAPI`/teams/`, () =>
            HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
          ),
          http.options(edaAPI`/organizations/`, () =>
            HttpResponse.json({ actions: { GET: {}, POST: {} } })
          )
        );

        const user = userEvent.setup();
        render(
          <MemoryRouter>
            <CreateTeam />
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
        });

        await user.type(screen.getByRole('textbox', { name: /name/i }), 'Test Team');

        await user.click(screen.getByTestId('organization_id'));
        await waitFor(() => {
          expect(screen.getByRole('option', { name: 'Default' })).toBeInTheDocument();
        });
        await user.click(screen.getByRole('option', { name: 'Default' }));

        await user.click(screen.getByTestId('Submit'));

        await waitFor(() => {
          expect(screen.getByRole('alert')).toBeInTheDocument();
        });
        expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
      }
    );
  });

  describe('EditTeam', () => {
    it('should render loading state before team loads', async () => {
      server.use(
        http.get('*/teams/5/', async () => {
          await new Promise((r) => setTimeout(r, 5000));
          return HttpResponse.json({ id: 5, name: 'Team' });
        })
      );

      const { EditTeam } = await import('./TeamForm');

      render(
        <MemoryRouter initialEntries={['/teams/5/edit']}>
          <Routes>
            <Route path="/teams/:id/edit" element={<EditTeam />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: 'Team', level: 1 })).toBeInTheDocument();
    });

    it('should render edit team form with populated data', async () => {
      server.use(
        http.get('*/teams/5/', () =>
          HttpResponse.json({
            id: 5,
            name: 'Existing Team',
            description: 'A test team',
            organization: { id: 1, name: 'Default' },
          })
        ),
        http.patch('*/teams/5/', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({ id: 5, ...(body as object) });
        })
      );

      const { EditTeam } = await import('./TeamForm');

      render(
        <MemoryRouter initialEntries={['/teams/5/edit']}>
          <Routes>
            <Route path="/teams/:id/edit" element={<EditTeam />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /edit existing team/i, level: 1 })
        ).toBeInTheDocument();
      });

      expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Existing Team');
    });

    it('should display breadcrumbs with Teams link', async () => {
      server.use(
        http.get('*/teams/5/', () =>
          HttpResponse.json({
            id: 5,
            name: 'Existing Team',
            description: '',
            organization: { id: 1, name: 'Default' },
          })
        )
      );

      const { EditTeam } = await import('./TeamForm');

      render(
        <MemoryRouter initialEntries={['/teams/5/edit']}>
          <Routes>
            <Route path="/teams/:id/edit" element={<EditTeam />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Teams')).toBeInTheDocument();
      });
    });
  });
});
