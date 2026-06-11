/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageFormProjectSelect } from './PageFormProjectSelect';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/api/v2/projects/'),
    () =>
      HttpResponse.json({
        count: 2,
        results: [
          { id: 1, name: 'Project A', organization: 1 },
          { id: 2, name: 'Project B', organization: 1 },
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

describe('PageFormProjectSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render Project label', async () => {
    render(
      <TestWrapper>
        <PageFormProjectSelect name="project" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Project')).toBeInTheDocument();
    });
  });

  it('should render placeholder', async () => {
    render(
      <TestWrapper>
        <PageFormProjectSelect name="project" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select project')).toBeInTheDocument();
    });
  });
});
