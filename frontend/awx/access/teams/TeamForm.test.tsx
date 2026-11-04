import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateTeam, EditTeam } from './TeamForm';

const mockOrganizations = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { id: 1, name: 'Default', type: 'organization' },
    { id: 2, name: 'Organization 1', type: 'organization' },
  ],
};

const server = setupServer(
  http.options(awxAPI`/teams/`, () => {
    return HttpResponse.json({ actions: { POST: {} } });
  }),
  http.options(awxAPI`/organizations/`, () => {
    return HttpResponse.json({ actions: { GET: {} } });
  }),
  http.get(awxAPI`/organizations/`, () => {
    return HttpResponse.json(mockOrganizations);
  }),
  http.post(awxAPI`/teams/`, () => {
    return HttpResponse.json(
      { id: 1, name: 'Test Team', organization: 1, type: 'team' },
      { status: 201 }
    );
  }),
  http.get(awxAPI`/teams/1/`, () =>
    HttpResponse.json({ id: 1, name: 'Existing Team', organization: 1, description: '' })
  )
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
        http.post(awxAPI`/teams/`, async ({ request }) => {
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

    it.skip('should display error alert when server returns 500 on submit', async () => {
      server.use(
        http.post(awxAPI`/teams/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        ),
        http.options(awxAPI`/organizations/`, () =>
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

      // Select organization - click the select, then pick the option
      await user.click(screen.getByTestId('organization'));
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Default' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: 'Default' }));

      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });
  });

  describe('EditTeam', () => {
    it('renders edit team form when team is loaded', async () => {
      render(
        <MemoryRouter initialEntries={['/teams/1/edit']}>
          <Routes>
            <Route path="/teams/:id/edit" element={<EditTeam />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Edit Existing Team', level: 1 })
        ).toBeInTheDocument();
      });
    });
  });
});
