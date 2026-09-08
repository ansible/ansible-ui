import { FrameworkTranslationsProvider, PageDialogProvider } from '@ansible/ansible-ui-framework';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { act, fireEvent, renderHook, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useDeleteUserTokens } from './useDeleteAAPUserTokens';

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

describe('useDeleteAAPUserTokens', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const onComplete = vi.fn();
  const token: Token = {
    id: 1,
    type: 'o_auth2_access_token',
    url: '/api/v2/tokens/1/',
    description: 'Legacy token',
    created: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    user: 1,
    application: 1,
    scope: 'write',
    expires: '2024-12-31T00:00:00Z',
    last_used: null,
    summary_fields: {
      user: { id: 1, username: 'testuser', first_name: 'Test', last_name: 'User' },
      application: { id: 1, name: 'Test Application' },
    },
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageDialogProvider>
        <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
      </PageDialogProvider>
    </BrowserRouter>
  );

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
      result.current([token]);
    });

    const checkbox = screen.getByRole('checkbox');
    act(() => {
      fireEvent.click(checkbox);
    });

    const submitButton = screen.getByRole('button', { name: /Delete token/i });
    await act(async () => {
      fireEvent.click(submitButton);
      await Promise.resolve();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    });

    expect(awxCalled).toBe(true);
    expect(gatewayCalled).toBe(false);
    expect(onComplete).toHaveBeenCalled();
  });
});
