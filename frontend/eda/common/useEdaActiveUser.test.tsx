import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from './eda-utils';
import { EdaActiveUserProvider, useEdaActiveUser } from './useEdaActiveUser';

const server = setupServer();

function ActiveUserProbe() {
  const { activeEdaUser } = useEdaActiveUser();
  if (activeEdaUser === undefined) return <div>loading-user</div>;
  if (activeEdaUser === null) return <div>no-user</div>;
  return <div>{activeEdaUser.username}</div>;
}

describe('useEdaActiveUser', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should provide an empty context when disabled', () => {
    render(
      <EdaActiveUserProvider disabled>
        <ActiveUserProbe />
      </EdaActiveUserProvider>
    );

    expect(screen.getByText('loading-user')).toBeInTheDocument();
  });

  it('should expose the current user when /users/me/ succeeds', async () => {
    server.use(
      http.get(edaAPI`/users/me/`, () => HttpResponse.json({ id: 7, username: 'eda-user' }))
    );

    render(
      <EdaActiveUserProvider>
        <ActiveUserProbe />
      </EdaActiveUserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('eda-user')).toBeInTheDocument();
    });
  });

  it('should expose null when /users/me/ fails', async () => {
    server.use(http.get(edaAPI`/users/me/`, () => HttpResponse.json({}, { status: 401 })));

    render(
      <EdaActiveUserProvider>
        <ActiveUserProbe />
      </EdaActiveUserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('no-user')).toBeInTheDocument();
    });
  });
});
