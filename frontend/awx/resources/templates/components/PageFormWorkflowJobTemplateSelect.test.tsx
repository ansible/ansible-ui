/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageFormWorkflowJobTemplateSelect } from './PageFormWorkflowJobTemplateSelect';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/api/v2/workflow_job_templates/'),
    () =>
      HttpResponse.json({
        count: 2,
        results: [
          { id: 1, name: 'Workflow A', type: 'workflow_job_template' },
          { id: 2, name: 'Workflow B', type: 'workflow_job_template' },
        ],
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

describe('PageFormWorkflowJobTemplateSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render Workflow job template label', async () => {
    render(
      <TestWrapper>
        <PageFormWorkflowJobTemplateSelect name="workflow_job_template" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Workflow job template')).toBeInTheDocument();
    });
  });

  it('should render placeholder', async () => {
    render(
      <TestWrapper>
        <PageFormWorkflowJobTemplateSelect name="workflow_job_template" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select workflow job template')).toBeInTheDocument();
    });
  });
});
