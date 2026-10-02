/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { hubAPI } from '../common/api/formatPath';
import { CreateExecutionEnvironment } from './ExecutionEnvironmentForm';

const server = setupServer(
  http.get(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
    HttpResponse.json({ meta: { count: 0 }, data: [], links: {} })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ExecutionEnvironmentForm - OPTIONS-driven validation wiring', () => {
  it('fetches field patterns from the _ui/v1/execution-environments/remotes/ endpoint and validates on blur', async () => {
    server.use(
      http.options(hubAPI`/_ui/v1/execution-environments/remotes/`, () =>
        HttpResponse.json({
          actions: {
            POST: {
              upstream_name: {
                pattern: '^[a-zA-Z0-9_-]+$',
                patternDescription: 'Upstream name must contain only letters, numbers, - and _.',
              },
            },
          },
        })
      )
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreateExecutionEnvironment />
      </MemoryRouter>
    );

    const upstreamNameInput = await screen.findByRole('textbox', { name: 'Upstream name' });
    await user.type(upstreamNameInput, 'invalid name!');
    await user.click(document.body);

    await waitFor(() => {
      expect(
        screen.getByText('Upstream name must contain only letters, numbers, - and _.')
      ).toBeInTheDocument();
    });
  });
});
