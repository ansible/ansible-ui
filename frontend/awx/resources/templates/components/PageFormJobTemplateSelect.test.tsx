/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageFormJobTemplateSelect } from './PageFormJobTemplateSelect';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/api/v2/job_templates/'),
    () =>
      HttpResponse.json({
        count: 2,
        results: [
          { id: 1, name: 'Job Template A', type: 'job_template' },
          { id: 2, name: 'Job Template B', type: 'job_template' },
        ],
        next: null,
      })
  ),
  http.get(
    ({ request }) => request.url.includes('/api/v2/workflow_job_templates/'),
    () =>
      HttpResponse.json({
        count: 0,
        results: [],
        next: null,
      })
  )
);

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm();
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormJobTemplateSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render Job template label', async () => {
    render(
      <TestWrapper>
        <PageFormJobTemplateSelect name="job_template" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Job template')).toBeInTheDocument();
    });
  });

  it('should render placeholder', async () => {
    render(
      <TestWrapper>
        <PageFormJobTemplateSelect name="job_template" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select job template')).toBeInTheDocument();
    });
  });

  it('should render Workflow job template label when templateType is workflow', async () => {
    render(
      <TestWrapper>
        <PageFormJobTemplateSelect
          name="workflow_job_template"
          templateType="workflow_job_templates"
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Workflow job template')).toBeInTheDocument();
    });
  });
});
