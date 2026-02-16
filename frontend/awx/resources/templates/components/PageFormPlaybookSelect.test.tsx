/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageFormPlaybookSelect } from './PageFormPlaybookSelect';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/api/v2/projects/1/playbooks/'),
    () => HttpResponse.json(['hello_world.yml', 'test.yml'])
  )
);

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({
    defaultValues: { project: 1 },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('PageFormPlaybookSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render Playbook label', async () => {
    render(
      <TestWrapper>
        <PageFormPlaybookSelect name="playbook" label="Playbook" watch="project" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Playbook')).toBeInTheDocument();
    });
  });

  it('should render with custom label', async () => {
    render(
      <TestWrapper>
        <PageFormPlaybookSelect name="playbook" label="Select playbook" watch="project" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select playbook')).toBeInTheDocument();
    });
  });
});
