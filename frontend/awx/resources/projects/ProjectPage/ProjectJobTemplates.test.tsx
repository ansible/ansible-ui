import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { ProjectJobTemplates } from './ProjectJobTemplates';

const mockJobTemplatesResponse = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const mockOptionsResponse = {
  actions: {
    GET: {},
    POST: {},
  },
};

const server = setupServer(
  http.get(awxAPI`/job_templates/`, () => {
    return HttpResponse.json(mockJobTemplatesResponse);
  }),
  http.options(awxAPI`/job_templates/`, () => {
    return HttpResponse.json(mockOptionsResponse);
  }),
  http.options(awxAPI`/workflow_job_templates/`, () => {
    return HttpResponse.json(mockOptionsResponse);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ProjectJobTemplates Component', () => {
  test('renders Domains filter in a section at the top of the page', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/123/job-templates']}>
        <Routes>
          <Route path="/projects/:id/job-templates" element={<ProjectJobTemplates />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        const domainsElement = screen.getByText('Domains');
        expect(domainsElement).toBeInTheDocument();

        const parent = domainsElement.closest('section');
        expect(parent).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
