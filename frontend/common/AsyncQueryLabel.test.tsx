import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SwrTestWrapper } from '../../framework/test-utils/swrTestWrapper';
import { AsyncQueryLabel } from './AsyncQueryLabel';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AsyncQueryLabel', () => {
  it('should return null when id is undefined', () => {
    const { container } = render(
      <SwrTestWrapper>
        <AsyncQueryLabel url="/api/v2/organizations/" id={undefined} />
      </SwrTestWrapper>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should show spinner while loading', () => {
    server.use(
      http.get('/api/v2/organizations/1/', async () => {
        await new Promise(() => undefined);
        return HttpResponse.json({ name: 'Default' });
      })
    );

    render(
      <SwrTestWrapper>
        <AsyncQueryLabel url="/api/v2/organizations/" id={1} />
      </SwrTestWrapper>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render field value from API response', async () => {
    server.use(
      http.get('/api/v2/organizations/2/', () => HttpResponse.json({ name: 'Engineering' }))
    );

    render(
      <SwrTestWrapper>
        <AsyncQueryLabel url="/api/v2/organizations/" id={2} />
      </SwrTestWrapper>
    );

    await waitFor(() => expect(screen.getByText('Engineering')).toBeInTheDocument());
  });

  it('should fall back to id on 404', async () => {
    server.use(
      http.get('/api/v2/organizations/3/', () =>
        HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
      )
    );

    render(
      <SwrTestWrapper>
        <AsyncQueryLabel url="/api/v2/organizations/" id={3} />
      </SwrTestWrapper>
    );

    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
  });

  it('should fall back to resourceName on 403', async () => {
    server.use(
      http.get('/api/v2/organizations/4/', () =>
        HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
      )
    );

    render(
      <SwrTestWrapper>
        <AsyncQueryLabel url="/api/v2/organizations/" id={4} resourceName="Hidden Org" />
      </SwrTestWrapper>
    );

    await waitFor(() => expect(screen.getByText('Hidden Org')).toBeInTheDocument());
  });

  it('should show error message for non-404/403 request errors', async () => {
    server.use(
      http.get('/api/v2/organizations/5/', () =>
        HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      )
    );

    render(
      <SwrTestWrapper>
        <AsyncQueryLabel url="/api/v2/organizations/" id={5} />
      </SwrTestWrapper>
    );

    await waitFor(() => expect(screen.getByText('Internal Server Error')).toBeInTheDocument());
  });
});
