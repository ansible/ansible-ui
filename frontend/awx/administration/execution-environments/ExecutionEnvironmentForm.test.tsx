import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateExecutionEnvironment, EditExecutionEnvironment } from './ExecutionEnvironmentForm';

const mockOrganizations = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { id: 1, name: 'Default', type: 'organization' },
    { id: 2, name: 'Other Org', type: 'organization' },
  ],
};

const mockRegistryCredentials = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: 'Demo Credential',
      credential_type: 17,
      summary_fields: { credential_type: { name: 'Container Registry' } },
    },
    {
      id: 3,
      name: 'Test Reg Cred',
      credential_type: 17,
      summary_fields: { credential_type: { name: 'Container Registry' } },
    },
  ],
};

const mockExecutionEnvironment = {
  id: 2,
  type: 'execution_environment',
  name: 'Test EE',
  description: 'Test description',
  image: 'test/image',
  managed: false,
  pull: 'always',
  credential: 3,
  organization: 1,
  summary_fields: {
    credential: { name: 'Test Reg Cred' },
    organization: { id: 1, name: 'Default' },
  },
};

const mockCredentialTypes = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 17, name: 'Container Registry', kind: 'registry' }],
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/organizations/'),
    () => HttpResponse.json(mockOrganizations)
  ),
  http.options(
    ({ request }) => request.url.includes('/organizations/'),
    () => HttpResponse.json({ actions: {} })
  ),
  http.get(
    ({ request }) => request.url.includes('/credentials/'),
    () => HttpResponse.json(mockRegistryCredentials)
  ),
  http.options(
    ({ request }) => request.url.includes('/credentials/'),
    () => HttpResponse.json({ actions: {} })
  ),
  http.get(
    ({ request }) => request.url.includes('/credential_types/'),
    () => HttpResponse.json(mockCredentialTypes)
  ),
  http.options(
    ({ request }) => request.url.includes('/credential_types/'),
    () => HttpResponse.json({ actions: {} })
  ),
  http.get(awxAPI`/execution_environments/:id/`, () => HttpResponse.json(mockExecutionEnvironment)),
  http.post(awxAPI`/execution_environments/`, async ({ request }) => {
    const body = (await request.json()) as { name: string; image: string };
    return HttpResponse.json({ id: 99, name: body.name, image: body.image }, { status: 201 });
  }),
  http.patch(awxAPI`/execution_environments/2/`, async ({ request }) => {
    const body = (await request.json()) as { name: string; image: string };
    return HttpResponse.json({ ...mockExecutionEnvironment, ...body });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ExecutionEnvironmentForm', () => {
  describe('CreateExecutionEnvironment', () => {
    it('should render create form with correct title', async () => {
      render(
        <MemoryRouter initialEntries={['/execution-environments/add']}>
          <Routes>
            <Route path="/execution-environments/add" element={<CreateExecutionEnvironment />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create execution environment');
      });
    });

    it('should display key form fields', async () => {
      render(
        <MemoryRouter initialEntries={['/execution-environments/add']}>
          <Routes>
            <Route path="/execution-environments/add" element={<CreateExecutionEnvironment />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /image/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
        expect(screen.getByText('Pull')).toBeInTheDocument();
      });
    });

    it('should display required indicators for name and image fields', async () => {
      render(
        <MemoryRouter initialEntries={['/execution-environments/add']}>
          <Routes>
            <Route path="/execution-environments/add" element={<CreateExecutionEnvironment />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Create execution environment/ })
        ).toBeInTheDocument();
      });

      const nameFormGroup = screen.getByTestId('name-form-group');
      expect(nameFormGroup.querySelector('.pf-v6-c-form__label-required')).toBeInTheDocument();
      const imageFormGroup = screen.getByTestId('image-form-group');
      expect(imageFormGroup.querySelector('.pf-v6-c-form__label-required')).toBeInTheDocument();
    });

    it('should allow entering name and image', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/execution-environments/add']}>
          <Routes>
            <Route path="/execution-environments/add" element={<CreateExecutionEnvironment />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter execution environment name')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('Enter execution environment name');
      const imageInput = screen.getByPlaceholderText('Enter image');

      await user.type(nameInput, 'Test EE');
      await user.type(imageInput, 'quay.io/test/ee:latest');

      expect(nameInput).toHaveValue('Test EE');
      expect(imageInput).toHaveValue('quay.io/test/ee:latest');
    });
  });

  describe('EditExecutionEnvironment', () => {
    it('should render edit form with correct title', async () => {
      render(
        <MemoryRouter initialEntries={['/execution-environments/2/edit']}>
          <Routes>
            <Route path="/execution-environments/:id/edit" element={<EditExecutionEnvironment />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Test EE');
      });
    });

    it('should preload form with existing execution environment data', async () => {
      render(
        <MemoryRouter initialEntries={['/execution-environments/2/edit']}>
          <Routes>
            <Route path="/execution-environments/:id/edit" element={<EditExecutionEnvironment />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test EE')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test/image')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
      });
    });

    it('should display form with Save button', async () => {
      render(
        <MemoryRouter initialEntries={['/execution-environments/2/edit']}>
          <Routes>
            <Route path="/execution-environments/:id/edit" element={<EditExecutionEnvironment />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test EE')).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: /Save execution environment/ })
      ).toBeInTheDocument();
    });
  });
});
