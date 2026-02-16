import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Project } from '../../../interfaces/Project';
import { ManualSubForm } from './ManualSubForm';

const configResponse = {
  project_base_dir: '/var/lib/awx/projects',
  project_local_paths: ['my-playbooks', 'other-playbooks'],
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/config/'),
    () => HttpResponse.json(configResponse)
  )
);

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<Project>({
    defaultValues: {
      scm_type: 'manual',
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('ManualSubForm', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render Playbook directory label when scm_type is manual', async () => {
    render(
      <TestWrapper>
        <ManualSubForm />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Playbook directory')).toBeInTheDocument();
    });
  });

  it('should render Project base path label when scm_type is manual', async () => {
    render(
      <TestWrapper>
        <ManualSubForm />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Project base path')).toBeInTheDocument();
    });
  });

  it('should render Type Details section when scm_type is manual', async () => {
    render(
      <TestWrapper>
        <ManualSubForm />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Type Details')).toBeInTheDocument();
    });
  });
});
