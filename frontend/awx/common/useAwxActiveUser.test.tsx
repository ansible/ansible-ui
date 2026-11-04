import { render, renderHook, waitFor } from '@testing-library/react';
import { SwrTestWrapper } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { AwxUser } from '../interfaces/User';
import {
  AwxActiveUserProvider,
  AwxActiveUserProviderInternal,
  useAwxActiveUser,
} from './useAwxActiveUser';
import { awxAPI } from './api/awx-utils';

const mockUser: AwxUser = {
  id: 1,
  username: 'admin',
  type: 'user',
} as AwxUser;

const server = setupServer(
  http.get(awxAPI`/me/`, () =>
    HttpResponse.json({
      count: 1,
      results: [mockUser],
    })
  )
);

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SwrTestWrapper>
      <AwxActiveUserProviderInternal>{children}</AwxActiveUserProviderInternal>
    </SwrTestWrapper>
  );
}

describe('useAwxActiveUser', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('loads active user from /me/', async () => {
    const { result } = renderHook(() => useAwxActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeAwxUser?.username).toBe('admin');
    });
    expect(result.current.refreshActiveAwxUser).toBeDefined();
  });

  it('returns null active user when request fails', async () => {
    server.use(http.get(awxAPI`/me/`, () => new HttpResponse(null, { status: 403 })));

    const { result } = renderHook(() => useAwxActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeAwxUser).toBeNull();
    });
  });

  it('AwxActiveUserProvider skips fetching when disabled', () => {
    const { result } = renderHook(() => useAwxActiveUser(), {
      wrapper: ({ children }) => (
        <SwrTestWrapper>
          <AwxActiveUserProvider disabled>{children}</AwxActiveUserProvider>
        </SwrTestWrapper>
      ),
    });
    expect(result.current.activeAwxUser).toBeUndefined();
  });

  it('AwxActiveUserProvider renders children', () => {
    const { getByText } = render(
      <SwrTestWrapper>
        <AwxActiveUserProvider>
          <span>child</span>
        </AwxActiveUserProvider>
      </SwrTestWrapper>
    );
    expect(getByText('child')).toBeInTheDocument();
  });
});
