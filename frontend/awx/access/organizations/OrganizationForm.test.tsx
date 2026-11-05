import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { requestPatch } from '@ansible/common-ui/crud/Data';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateOrganization, EditOrganization } from './OrganizationForm';

vi.mock('@ansible/common-ui/crud/usePostRequest');
vi.mock('@ansible/common-ui/crud/Data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/common-ui/crud/Data')>();
  return {
    ...actual,
    requestPatch: vi.fn(),
  };
});

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

const mockOrganizationsOptions = { actions: { GET: {}, POST: {} } };
const mockInstanceGroups = { count: 0, results: [], next: null, previous: null };
const mockExecutionEnvironments = { count: 0, results: [], next: null, previous: null };

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('/organizations/'),
    () => HttpResponse.json(mockOrganizationsOptions)
  ),
  http.options(
    ({ request }) => request.url.includes('/instance_groups/'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.options(
    ({ request }) => request.url.includes('/execution_environments/'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/instance_groups/') && !request.url.includes('/organizations/'),
    () => HttpResponse.json(mockInstanceGroups)
  ),
  http.get(
    ({ request }) => request.url.includes('/execution_environments/'),
    () => HttpResponse.json(mockExecutionEnvironments)
  ),
  http.get(awxAPI`/organizations/1/`, () =>
    HttpResponse.json({ id: 1, name: 'Default', description: '' })
  ),
  http.get(awxAPI`/organizations/1/instance_groups/`, () => HttpResponse.json({ results: [] }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
beforeEach(() => {
  navigateMock.mockClear();
  vi.mocked(usePostRequest).mockReturnValue(
    vi.fn().mockResolvedValue({ id: 1, name: 'New Org' }) as ReturnType<typeof usePostRequest>
  );
  vi.mocked(requestPatch).mockResolvedValue({ id: 1, name: 'Default' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('OrganizationForm', () => {
  describe('CreateOrganization', () => {
    it('should render create organization page with title and Name field', async () => {
      render(
        <MemoryRouter initialEntries={['/organizations/create']}>
          <Routes>
            <Route path="/organizations/create" element={<CreateOrganization />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create organization');
      });

      expect(screen.getByTestId('name-form-group')).toBeInTheDocument();
    });

    it('submits create organization form', async () => {
      const user = userEvent.setup();
      const postRequest = vi.fn().mockResolvedValue({ id: 5, name: 'Acme' });
      vi.mocked(usePostRequest).mockReturnValue(postRequest as ReturnType<typeof usePostRequest>);

      render(
        <MemoryRouter initialEntries={['/organizations/create']}>
          <Routes>
            <Route path="/organizations/create" element={<CreateOrganization />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name-form-group')).toBeInTheDocument();
      });

      await user.type(screen.getByRole('textbox', { name: /name/i }), 'Acme');
      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(postRequest).toHaveBeenCalled();
      });
    });

    it('navigates back when cancel is clicked on create', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/organizations/create']}>
          <Routes>
            <Route path="/organizations/create" element={<CreateOrganization />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });

  describe('EditOrganization', () => {
    it('renders edit organization form when data is loaded', async () => {
      render(
        <MemoryRouter initialEntries={['/organizations/1/edit']}>
          <Routes>
            <Route path="/organizations/:id/edit" element={<EditOrganization />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Default');
      });
    });

    it('shows header while organization is loading', () => {
      server.use(http.get(awxAPI`/organizations/1/`, () => new Promise(() => {})));
      render(
        <MemoryRouter initialEntries={['/organizations/1/edit']}>
          <Routes>
            <Route path="/organizations/:id/edit" element={<EditOrganization />} />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    });

    it('submits edit organization form', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/organizations/1/edit']}>
          <Routes>
            <Route path="/organizations/:id/edit" element={<EditOrganization />} />
          </Routes>
        </MemoryRouter>
      );
      await waitFor(() =>
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Default')
      );
      await user.click(screen.getByTestId('Submit'));
      await waitFor(() => expect(requestPatch).toHaveBeenCalled());
    });

    it('navigates back when cancel is clicked on edit', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/organizations/1/edit']}>
          <Routes>
            <Route path="/organizations/:id/edit" element={<EditOrganization />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });
});
