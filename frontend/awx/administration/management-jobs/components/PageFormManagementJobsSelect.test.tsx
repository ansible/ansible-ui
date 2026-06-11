/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { PageFormManagementJobsSelect } from './PageFormManagementJobsSelect';

const systemJobTemplatesResponse = {
  count: 0,
  results: [],
  next: null,
  previous: null,
};

const server = setupServer(
  http.options(awxAPI`/system_job_templates/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(
    ({ request }) =>
      request.url.includes('/system_job_templates/') &&
      !request.url.includes('/system_job_templates/1/'),
    () => HttpResponse.json(systemJobTemplatesResponse)
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

describe('PageFormManagementJobsSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    server.use(
      http.options(awxAPI`/system_job_templates/`, () =>
        HttpResponse.json({ actions: { GET: {} } })
      ),
      http.get(
        ({ request }) =>
          request.url.includes('/system_job_templates/') &&
          !request.url.includes('/system_job_templates/1/'),
        () => HttpResponse.json(systemJobTemplatesResponse)
      )
    );
  });

  it('should render with Management job template label', async () => {
    render(
      <TestWrapper>
        <PageFormManagementJobsSelect name="management_job" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Management job template')).toBeInTheDocument();
    });
  });

  it('should render with Select management job template placeholder', async () => {
    render(
      <TestWrapper>
        <PageFormManagementJobsSelect name="management_job" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select management job template')).toBeInTheDocument();
    });
  });
});
