import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { Templates } from './Templates';

const mockTemplates = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 7,
      type: 'job_template',
      name: 'Demo Job Template',
      description: '',
      unified_job_type: 'job',
      summary_fields: {
        user_capabilities: { edit: true, delete: true, start: true, copy: true },
        organization: { id: 1, name: 'Default' },
      },
    },
    {
      id: 8,
      type: 'workflow_job_template',
      name: 'Demo Workflow Template',
      description: 'A workflow template',
      unified_job_type: 'workflow_job',
      summary_fields: {
        user_capabilities: { edit: true, delete: true, start: true, copy: true },
        organization: { id: 1, name: 'Default' },
      },
    },
  ],
};

const server = setupServer(
  http.options(awxAPI`/unified_job_templates/`, () =>
    HttpResponse.json({ actions: { POST: {}, GET: {} } })
  ),
  http.get(awxAPI`/unified_job_templates/`, () => HttpResponse.json(mockTemplates))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Templates', () => {
  it('should display templates in table', async () => {
    render(
      <MemoryRouter>
        <Templates />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo Job Template')).toBeInTheDocument();
    });
  });

  it('should display multiple templates', async () => {
    render(
      <MemoryRouter>
        <Templates />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo Job Template')).toBeInTheDocument();
      expect(screen.getByText('Demo Workflow Template')).toBeInTheDocument();
    });
  });

  it('should display error when templates fail to load', async () => {
    server.use(
      http.get(awxAPI`/unified_job_templates/`, () => HttpResponse.json({}, { status: 500 }))
    );

    render(
      <MemoryRouter>
        <Templates />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading templates/i)).toBeInTheDocument();
    });
  });
});
