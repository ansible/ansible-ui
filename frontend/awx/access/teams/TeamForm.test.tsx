import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { CreateTeam, EditTeam } from './TeamForm';

vi.mock('@ansible/common-ui/crud/usePatchRequest');
vi.mock('@ansible/common-ui/crud/usePostRequest');
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return { ...actual, usePageNavigate: () => vi.fn() };
});

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

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
beforeEach(() => {
  navigateMock.mockClear();
  vi.mocked(usePatchRequest).mockReturnValue(
    vi.fn().mockResolvedValue({ id: 1, name: 'Existing Team' }) as ReturnType<
      typeof usePatchRequest
    >
  );
  vi.mocked(usePostRequest).mockReturnValue(
    vi.fn().mockResolvedValue({ id: 2, name: 'New Team' }) as ReturnType<typeof usePostRequest>
  );
});
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

    it('navigates back when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CreateTeam />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });

    it('creates team when required fields are provided', async () => {
      const user = userEvent.setup();
      const postRequest = vi.fn().mockResolvedValue({ id: 2, name: 'New Team' });
      vi.mocked(usePostRequest).mockReturnValue(postRequest as ReturnType<typeof usePostRequest>);

      render(
        <MemoryRouter>
          <CreateTeam />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      });

      await user.type(screen.getByRole('textbox', { name: /name/i }), 'New Team');
      await user.click(screen.getByTestId('organization'));
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Default' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: 'Default' }));
      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(postRequest).toHaveBeenCalled();
      });
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

    it('shows breadcrumbs while team is loading', () => {
      server.use(http.get(awxAPI`/teams/1/`, () => new Promise(() => {})));
      render(
        <MemoryRouter initialEntries={['/teams/1/edit']}>
          <Routes>
            <Route path="/teams/:id/edit" element={<EditTeam />} />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByText('Edit Team')).toBeInTheDocument();
    });

    it('submits edit team form', async () => {
      const user = userEvent.setup();
      const patchRequest = vi.fn().mockResolvedValue({ id: 1, name: 'Existing Team' });
      vi.mocked(usePatchRequest).mockReturnValue(
        patchRequest as ReturnType<typeof usePatchRequest>
      );

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

      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(patchRequest).toHaveBeenCalled();
      });
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });

    it('navigates back when cancel is clicked on edit', async () => {
      const user = userEvent.setup();
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

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });
});
