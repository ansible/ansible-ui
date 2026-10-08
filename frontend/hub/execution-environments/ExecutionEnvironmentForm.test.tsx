/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CreateExecutionEnvironment } from './ExecutionEnvironmentForm';

const server = setupServer(
  http.options('*/v3/plugin/execution-environments/repositories/*', () =>
    HttpResponse.json({ actions: { POST: {} } })
  ),
  http.get('*/v3/plugin/execution-environments/repositories/*', () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CreateExecutionEnvironment', () => {
  it('renders create execution environment form', () => {
    render(
      <MemoryRouter>
        <CreateExecutionEnvironment />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('button', { name: /Create execution environment/i })
    ).toBeInTheDocument();
  });
});
