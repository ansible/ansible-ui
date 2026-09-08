import { FrameworkTranslationsProvider, PageDialogProvider } from '@ansible/ansible-ui-framework';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { act, fireEvent, renderHook, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { getTokenDeleteUrl, useDeleteUserTokens } from './useDeleteAAPUserTokens';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({ children, title }: { children: React.ReactNode; title: string }) => (
      <div data-testid="modal">
        <h1>{title}</h1>
        {children}
      </div>
    ),
  };
});

const server = setupServer();

function createToken(overrides: Partial<Token> & Pick<Token, 'id' | 'type' | 'url'>): Token {
  return {
    description: 'Test token',
    created: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    user: 1,
    application: 1,
    scope: 'read',
    expires: '2024-12-31T00:00:00Z',
    last_used: null,
    summary_fields: {
      user: { id: 1, username: 'testuser', first_name: 'Test', last_name: 'User' },
      application: { id: 1, name: 'Test Application' },
    },
    ...overrides,
  };
}

const legacyToken = createToken({
  id: 1,
  type: 'o_auth2_access_token',
  url: '/api/v2/tokens/1/',
  description: 'Legacy token',
  scope: 'write',
});

const gatewayToken = createToken({
  id: 2,
  type: 'Access Token',
  url: '/api/gateway/v1/tokens/2/',
  description: 'Gateway token',
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <PageDialogProvider>
      <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
    </PageDialogProvider>
  </BrowserRouter>
);

async function confirmTokenDeletion() {
  fireEvent.click(screen.getByRole('checkbox'));
  await act(() => {
    fireEvent.click(screen.getByRole('button', { name: /Delete token/i }));
  });
}

describe('getTokenDeleteUrl', () => {
  it('routes legacy controller tokens to the AWX API', () => {
    expect(getTokenDeleteUrl(legacyToken)).toBe(awxAPI`/tokens/1/`);
  });

  it('routes gateway tokens to the gateway API', () => {
    expect(getTokenDeleteUrl(gatewayToken)).toBe(gatewayAPI`/tokens/2/`);
  });

  it('prefers the gateway URL when the token URL points at the gateway', () => {
    const token = createToken({
      id: 3,
      type: 'o_auth2_access_token',
      url: '/api/gateway/v1/tokens/3/',
    });

    expect(getTokenDeleteUrl(token)).toBe(gatewayAPI`/tokens/3/`);
  });

  it('prefers the controller URL when the token URL points at controller', () => {
    const token = createToken({
      id: 4,
      type: 'Access Token',
      url: '/api/v2/tokens/4/',
    });

    expect(getTokenDeleteUrl(token)).toBe(awxAPI`/tokens/4/`);
  });

  it('falls back to the legacy token type when the URL is ambiguous', () => {
    const token = createToken({
      id: 5,
      type: 'o_auth2_access_token',
      url: '/tokens/5/',
    });

    expect(getTokenDeleteUrl(token)).toBe(awxAPI`/tokens/5/`);
  });

  it('defaults to the gateway API for non-legacy access tokens with ambiguous URLs', () => {
    const token = createToken({
      id: 6,
      type: 'Access Token',
      url: '/tokens/6/',
    });

    expect(getTokenDeleteUrl(token)).toBe(gatewayAPI`/tokens/6/`);
  });
});

describe('useDeleteAAPUserTokens', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const onComplete = vi.fn();

  it('deletes the legacy token through the AWX controller API, not the gateway API', async () => {
    let awxCalled = false;
    let gatewayCalled = false;
    server.use(
      http.delete(awxAPI`/tokens/1/`, () => {
        awxCalled = true;
        return HttpResponse.json({});
      }),
      http.delete(gatewayAPI`/tokens/1/`, () => {
        gatewayCalled = true;
        return HttpResponse.json({});
      })
    );

    const { result } = renderHook(() => useDeleteUserTokens(onComplete), { wrapper });
    act(() => {
      result.current([legacyToken]);
    });

    await confirmTokenDeletion();

    await waitFor(() => {
      expect(awxCalled).toBe(true);
      expect(gatewayCalled).toBe(false);
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('deletes gateway tokens through the gateway API, not the AWX controller API', async () => {
    let awxCalled = false;
    let gatewayCalled = false;
    server.use(
      http.delete(awxAPI`/tokens/2/`, () => {
        awxCalled = true;
        return HttpResponse.json({});
      }),
      http.delete(gatewayAPI`/tokens/2/`, () => {
        gatewayCalled = true;
        return HttpResponse.json({});
      })
    );

    const { result } = renderHook(() => useDeleteUserTokens(onComplete), { wrapper });
    act(() => {
      result.current([gatewayToken]);
    });

    await confirmTokenDeletion();

    await waitFor(() => {
      expect(awxCalled).toBe(false);
      expect(gatewayCalled).toBe(true);
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('deletes mixed legacy and gateway tokens through their respective APIs', async () => {
    let awxCalled = false;
    let gatewayCalled = false;
    server.use(
      http.delete(awxAPI`/tokens/1/`, () => {
        awxCalled = true;
        return HttpResponse.json({});
      }),
      http.delete(gatewayAPI`/tokens/2/`, () => {
        gatewayCalled = true;
        return HttpResponse.json({});
      })
    );

    const { result } = renderHook(() => useDeleteUserTokens(onComplete), { wrapper });
    act(() => {
      result.current([legacyToken, gatewayToken]);
    });

    await confirmTokenDeletion();

    await waitFor(() => {
      expect(awxCalled).toBe(true);
      expect(gatewayCalled).toBe(true);
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
