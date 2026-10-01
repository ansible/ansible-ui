/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  resetTestSwrCache,
  SwrTestWrapper,
} from '../../../../../framework/test-utils/swrTestWrapper';
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
      <SwrTestWrapper>
        <FormProvider {...methods}>{children}</FormProvider>
      </SwrTestWrapper>
    </MemoryRouter>
  );
}

describe('PageFormApplicationSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => {
    server.resetHandlers();
    resetTestSwrCache();
  });
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

  it('should show permission helper when list probe returns 403', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/applications/') && !request.url.includes('/applications/1/'),
        () => new HttpResponse(null, { status: 403 })
      )
    );

    render(
      <TestWrapper>
        <PageFormApplicationSelect name="application" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'You do not have permission to view applications. Please contact your system administrator if there is an issue with your access.'
        )
      ).toBeInTheDocument();
    });
  });

  it('should hide browse when applications cannot be listed', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/applications/') && !request.url.includes('/applications/1/'),
        () => new HttpResponse(null, { status: 403 })
      )
    );

    render(
      <TestWrapper>
        <PageFormApplicationSelect name="application" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('application')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('application'));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Browse' })).not.toBeInTheDocument();
    });
  });

  it('should show generic error when dropdown list request fails', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/applications/') && !request.url.includes('/applications/1/'),
        ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get('page_size') === '1') {
            return HttpResponse.json(applicationsResponse);
          }
          return new HttpResponse(null, { status: 500 });
        }
      )
    );

    render(
      <TestWrapper>
        <PageFormApplicationSelect name="application" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('application')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('application'));

    await waitFor(() => {
      expect(screen.getByText('Error loading applications')).toBeInTheDocument();
    });
  });
});
