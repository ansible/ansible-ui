/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { PageFormSelectExecutionEnvironment } from './PageFormSelectExecutionEnvironment';

const executionEnvironmentsResponse = {
  count: 0,
  results: [],
  next: null,
  previous: null,
};

const server = setupServer(
  http.options(awxAPI`/execution_environments/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(
    ({ request }) =>
      request.url.includes('/execution_environments/') &&
      !request.url.includes('/execution_environments/1/'),
    () => HttpResponse.json(executionEnvironmentsResponse)
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

describe('PageFormSelectExecutionEnvironment', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    server.use(
      http.options(awxAPI`/execution_environments/`, () =>
        HttpResponse.json({ actions: { GET: {} } })
      ),
      http.get(
        ({ request }) =>
          request.url.includes('/execution_environments/') &&
          !request.url.includes('/execution_environments/1/'),
        () => HttpResponse.json(executionEnvironmentsResponse)
      )
    );
  });

  it('should render with Execution environment label', async () => {
    render(
      <TestWrapper>
        <PageFormSelectExecutionEnvironment name="execution_environment" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Execution environment')).toBeInTheDocument();
    });
  });

  it('should render with Select execution environment placeholder', async () => {
    render(
      <TestWrapper>
        <PageFormSelectExecutionEnvironment name="execution_environment" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Select execution environment')).toBeInTheDocument();
    });
  });
});
