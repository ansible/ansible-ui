/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { PageFormSelectOrganization } from './PageFormOrganizationSelect';

const organizationsResponse = {
  count: 1,
  results: [{ id: 1, name: 'Test Org' }],
  next: null,
  previous: null,
};

const server = setupServer(
  http.options(awxAPI`/organizations/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(
    ({ request }) =>
      request.url.includes('/organizations/') && !request.url.includes('/organizations/1/'),
    () => HttpResponse.json(organizationsResponse)
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

describe('PageFormSelectOrganization', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    server.use(
      http.options(awxAPI`/organizations/`, () => HttpResponse.json({ actions: { GET: {} } })),
      http.get(
        ({ request }) =>
          request.url.includes('/organizations/') && !request.url.includes('/organizations/1/'),
        () => HttpResponse.json(organizationsResponse)
      )
    );
  });

  it('should render with Organization label', async () => {
    render(
      <TestWrapper>
        <PageFormSelectOrganization name="organization" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Organization')).toBeInTheDocument();
    });
  });

  it('should render with Select organization placeholder', async () => {
    render(
      <TestWrapper>
        <PageFormSelectOrganization name="organization" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select organization')).toBeInTheDocument();
    });
  });
});
