import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
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

    it('should display error alert when server returns 500 on submit', async () => {
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
    });
  });
});
