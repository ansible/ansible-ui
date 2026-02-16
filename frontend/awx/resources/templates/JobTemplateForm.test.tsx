import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateJobTemplate, EditJobTemplate } from './TemplateForm';

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

const mockJobTemplate = {
  id: 1,
  name: 'Test Job Template',
  description: 'Test description',
  type: 'job_template',
  job_type: 'run',
  inventory: 1,
  project: 1,
  playbook: 'hello_world.yml',
  limit: '',
  verbosity: 0,
  forks: 0,
  become_enabled: false,
  allow_simultaneous: false,
  ask_variables_on_launch: false,
  ask_inventory_on_launch: false,
  ask_credential_on_launch: false,
  summary_fields: {
    inventory: { id: 1, name: 'Demo Inventory' },
    project: { id: 1, name: 'Demo Project' },
    user_capabilities: { edit: true, delete: true },
  },
};

const server = setupServer(
  http.options('*', () => HttpResponse.json({})),
  http.get(awxAPI`/job_templates/1/`, () => HttpResponse.json(mockJobTemplate)),
  http.get(awxAPI`/job_templates/1/instance_groups/`, () =>
    HttpResponse.json({ count: 0, results: [] })
  ),
  http.get(awxAPI`/projects/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Demo Project', organization: 1 }] })
  ),
  http.get(awxAPI`/inventories/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Demo Inventory' }] })
  ),
  http.get(awxAPI`/projects/1/`, () =>
    HttpResponse.json({ id: 1, name: 'Demo Project', organization: 1 })
  ),
  http.get(awxAPI`/projects/1/playbooks/`, () =>
    HttpResponse.json(['hello_world.yml', 'test.yml'])
  ),
  http.get('*', () => HttpResponse.json({}))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
beforeEach(() => vi.clearAllMocks());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('JobTemplateForm', () => {
  describe('CreateJobTemplate', () => {
    it('should render create job template form', async () => {
      render(
        <MemoryRouter>
          <CreateJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create job template');
      });
    });

    it('should display name input field', async () => {
      render(
        <MemoryRouter>
          <CreateJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toBeInTheDocument();
      });
    });

    it('should display description field', async () => {
      render(
        <MemoryRouter>
          <CreateJobTemplate />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('description')).toBeInTheDocument();
      });
    });
  });

  describe('EditJobTemplate', () => {
    it('should render edit job template form with title', async () => {
      render(
        <MemoryRouter initialEntries={['/job-templates/1/edit']}>
          <Routes>
            <Route path="/job-templates/:id/edit" element={<EditJobTemplate />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Test Job Template');
      });
    });

    it('should preload form with template name', async () => {
      render(
        <MemoryRouter initialEntries={['/job-templates/1/edit']}>
          <Routes>
            <Route path="/job-templates/:id/edit" element={<EditJobTemplate />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('Test Job Template');
      });
    });
  });
});
