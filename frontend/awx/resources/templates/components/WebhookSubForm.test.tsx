import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { JobTemplateForm } from '../../../interfaces/JobTemplateForm';
import { WebhookSubForm } from './WebhookSubForm';

vi.mock('../../../access/credentials/components/PageFormCredentialSelect', () => ({
  PageFormCredentialSelect: ({ label }: { label: string }) => (
    <div data-testid="credential-select">{label}</div>
  ),
}));

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/job_templates/1/webhook_key/') ||
      request.url.includes('/workflow_job_templates/1/webhook_key/'),
    () => HttpResponse.json({ webhook_key: 'test-key-123' })
  )
);

function TestWrapper({
  children,
  path = '/job_templates/1/edit',
  defaultValues = {},
}: {
  children: React.ReactNode;
  path?: string;
  defaultValues?: Partial<JobTemplateForm>;
}) {
  const methods = useForm<JobTemplateForm>({
    defaultValues: {
      isWebhookEnabled: true,
      webhook_service: 'github',
      ...defaultValues,
    },
  });
  return (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/job_templates/:id/edit"
          element={<FormProvider {...methods}>{children}</FormProvider>}
        />
        <Route
          path="/job_templates/create"
          element={<FormProvider {...methods}>{children}</FormProvider>}
        />
        <Route
          path="/workflow_job_templates/:id/edit"
          element={<FormProvider {...methods}>{children}</FormProvider>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('WebhookSubForm', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should render Webhook URL label when webhook is enabled', () => {
    render(
      <TestWrapper path="/job_templates/1/edit">
        <WebhookSubForm templateType="job_templates" />
      </TestWrapper>
    );

    expect(screen.getByText('Webhook URL')).toBeInTheDocument();
  });

  it('should render Webhook key label when webhook is enabled', () => {
    render(
      <TestWrapper path="/job_templates/1/edit">
        <WebhookSubForm templateType="job_templates" />
      </TestWrapper>
    );

    expect(screen.getByText('Webhook key')).toBeInTheDocument();
  });

  it('should render Webhook details section', () => {
    render(
      <TestWrapper path="/job_templates/1/edit">
        <WebhookSubForm templateType="job_templates" />
      </TestWrapper>
    );

    expect(screen.getByText('Webhook details')).toBeInTheDocument();
  });
});
