/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageFormLabelSelect } from './PageFormLabelSelect';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/api/v2/labels/'),
    () =>
      HttpResponse.json({ count: 2, results: [{ name: 'label1' }, { name: 'label2' }], next: null })
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

describe('PageFormLabelSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render Labels label', async () => {
    render(
      <TestWrapper>
        <PageFormLabelSelect name="labels" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Labels')).toBeInTheDocument();
    });
  });

  it('should render placeholder when loaded', async () => {
    render(
      <TestWrapper>
        <PageFormLabelSelect name="labels" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Select or create labels')).toBeInTheDocument();
    });
  });
});
