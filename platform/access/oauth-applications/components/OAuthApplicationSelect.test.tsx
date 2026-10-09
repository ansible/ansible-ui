/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { resetTestSwrCache, SwrTestWrapper } from '../../../../framework/test-utils/swrTestWrapper';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { OAuthApplicationSelect } from './OAuthApplicationSelect';

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

const defaultApplicationsList = {
  count: 0,
  results: [],
};

const server = setupServer(
  http.get(gatewayAPI`/applications/`, () => HttpResponse.json(defaultApplicationsList)),
  http.options(gatewayAPI`/applications/`, () =>
    HttpResponse.json({ actions: { GET: {}, POST: {} } })
  )
);

describe('OAuthApplicationSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  beforeEach(() => {
    server.resetHandlers();
    resetTestSwrCache();
  });

  afterEach(() => {
    resetTestSwrCache();
  });

  test('should show permission helper when list probe returns 403', async () => {
    server.use(http.get(gatewayAPI`/applications/`, () => new HttpResponse(null, { status: 403 })));

    render(
      <TestWrapper>
        <OAuthApplicationSelect name="application" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'You do not have permission to view OAuth applications. Please contact your system administrator if there is an issue with your access.'
        )
      ).toBeInTheDocument();
    });
  });

  test('should show empty options message when list is allowed but empty', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(gatewayAPI`/applications/`, () => HttpResponse.json({ count: 0, results: [] }))
    );

    render(
      <TestWrapper>
        <OAuthApplicationSelect name="application" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('application')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('application'));

    await waitFor(() => {
      expect(screen.getByText('No options currently available.')).toBeInTheDocument();
    });
  });

  test('should hide browse when applications cannot be listed', async () => {
    const user = userEvent.setup();
    server.use(http.get(gatewayAPI`/applications/`, () => new HttpResponse(null, { status: 403 })));

    render(
      <TestWrapper>
        <OAuthApplicationSelect name="application" />
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

  test('should show generic error when list returns 500', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(gatewayAPI`/applications/`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('page_size') === '1') {
          return HttpResponse.json({ count: 1, results: [{ id: 1, name: 'App' }] });
        }
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(
      <TestWrapper>
        <OAuthApplicationSelect name="application" />
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
