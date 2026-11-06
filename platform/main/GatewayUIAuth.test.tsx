import { render, renderHook, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { UIAuth } from '../interfaces/UIAuth';
import { GatewayUIAuthProvider, useGatewayUIAuth, useIsManagedCloudInstall } from './GatewayUIAuth';

const mockRequestGet = vi.fn();

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: (...args: unknown[]): Promise<UIAuth> => mockRequestGet(...args) as Promise<UIAuth>,
}));

describe('GatewayUIAuth', () => {
  test('should provide ui_auth data to consumers', async () => {
    const uiAuth: UIAuth = {
      show_login_form: true,
      passwords: [],
      ssos: [],
      login_redirect_override: '',
      custom_login_info: '',
      custom_logo: '',
      managed_cloud_install: true,
      legacy_automation_hub_sso_url: '',
      legacy_controller_sso_url: '',
      legacy_auth_enabled: false,
    };

    mockRequestGet.mockResolvedValueOnce(uiAuth);

    function Consumer() {
      const data = useGatewayUIAuth();
      const managed = useIsManagedCloudInstall();
      return (
        <div>
          <span data-testid="managed">{String(managed)}</span>
          <span data-testid="raw">
            {data ? JSON.stringify(data.managed_cloud_install) : 'empty'}
          </span>
        </div>
      );
    }

    function TestRoot({ children }: { children: ReactNode }) {
      return (
        <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
          <GatewayUIAuthProvider>{children}</GatewayUIAuthProvider>
        </SWRConfig>
      );
    }

    render(
      <TestRoot>
        <Consumer />
      </TestRoot>
    );

    expect(await screen.findByTestId('managed')).toHaveTextContent('true');
    expect(screen.getByTestId('raw')).toHaveTextContent('true');
  });

  test('useGatewayUIAuth should return undefined outside provider', () => {
    const { result } = renderHook(() => useGatewayUIAuth());
    expect(result.current).toBeUndefined();
  });
});
