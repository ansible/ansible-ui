/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../../common/api/awx-utils';
import { PageFormExternalCredentialSelect } from './PageFormExternalCredentialSelect';

const credentialsResponse = {
  count: 0,
  results: [],
  next: null,
  previous: null,
};

const server = setupServer(
  http.options(awxAPI`/credentials/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.options(awxAPI`/credential_types/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(
    ({ request }) =>
      request.url.includes('/credentials/') && !request.url.includes('/credentials/1/'),
    () => HttpResponse.json(credentialsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/credential_types/'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
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

describe('PageFormExternalCredentialSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    server.use(
      http.options(awxAPI`/credentials/`, () => HttpResponse.json({ actions: { GET: {} } })),
      http.options(awxAPI`/credential_types/`, () => HttpResponse.json({ actions: { GET: {} } })),
      http.get(
        ({ request }) =>
          request.url.includes('/credentials/') && !request.url.includes('/credentials/1/'),
        () => HttpResponse.json(credentialsResponse)
      ),
      http.get(
        ({ request }) => request.url.includes('/credential_types/'),
        () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
      )
    );
  });

  it('should render with Credential label', async () => {
    render(
      <TestWrapper>
        <PageFormExternalCredentialSelect name="source_credential" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Credential')).toBeInTheDocument();
    });
  });

  it('should render with Select credential placeholder', async () => {
    render(
      <TestWrapper>
        <PageFormExternalCredentialSelect name="source_credential" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select credential')).toBeInTheDocument();
    });
  });
});
