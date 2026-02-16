/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { PageFormApplicationSelect } from './PageFormApplicationSelect';

const applicationsResponse = {
  count: 0,
  results: [],
  next: null,
  previous: null,
};

const server = setupServer(
  http.options(awxAPI`/applications/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(
    ({ request }) =>
      request.url.includes('/applications/') && !request.url.includes('/applications/1/'),
    () => HttpResponse.json(applicationsResponse)
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

describe('PageFormApplicationSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    server.use(
      http.options(awxAPI`/applications/`, () => HttpResponse.json({ actions: { GET: {} } })),
      http.get(
        ({ request }) =>
          request.url.includes('/applications/') && !request.url.includes('/applications/1/'),
        () => HttpResponse.json(applicationsResponse)
      )
    );
  });

  it('should render with Application label', async () => {
    render(
      <TestWrapper>
        <PageFormApplicationSelect name="application" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Application')).toBeInTheDocument();
    });
  });

  it('should render with Select application placeholder', async () => {
    render(
      <TestWrapper>
        <PageFormApplicationSelect name="application" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select application')).toBeInTheDocument();
    });
  });
});
