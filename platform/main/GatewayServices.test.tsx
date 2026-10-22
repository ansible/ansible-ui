import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import {
  GatewayServicesContext,
  useGatewayService,
  useHasAwxService,
  useHasEdaService,
  useHasHubService,
} from './GatewayServices';

vi.mock('@ansible/awx-ui/common/useAwxConfig', () => ({
  useAwxConfigState: () => ({ serviceDown: false }),
}));

function createWrapper(services: {
  gateway?: string;
  controller?: string;
  eda?: string;
  galaxy?: string;
}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <GatewayServicesContext.Provider value={services}>{children}</GatewayServicesContext.Provider>
    );
  };
}

describe('GatewayServices hooks', () => {
  test('useGatewayService should return the requested service URL', () => {
    const wrapper = createWrapper({
      gateway: 'https://gateway',
      controller: 'https://controller',
      eda: 'https://eda',
      galaxy: 'https://hub',
    });

    const { result: controller } = renderHook(() => useGatewayService('controller'), { wrapper });
    const { result: hub } = renderHook(() => useGatewayService('hub'), { wrapper });

    expect(controller.current).toBe('https://controller');
    expect(hub.current).toBe('https://hub');
  });

  test('useHasAwxService should be undefined until gateway is known', () => {
    const { result } = renderHook(() => useHasAwxService(), {
      wrapper: createWrapper({ controller: 'https://controller' }),
    });

    expect(result.current).toBeUndefined();
  });

  test('useHasAwxService should reflect controller availability', () => {
    const { result: hasAwx } = renderHook(() => useHasAwxService(), {
      wrapper: createWrapper({ gateway: 'https://gateway', controller: 'https://controller' }),
    });
    const { result: noAwx } = renderHook(() => useHasAwxService(), {
      wrapper: createWrapper({ gateway: 'https://gateway' }),
    });

    expect(hasAwx.current).toBe(true);
    expect(noAwx.current).toBe(false);
  });

  test('useHasEdaService and useHasHubService should reflect optional services', () => {
    const wrapper = createWrapper({
      gateway: 'https://gateway',
      eda: 'https://eda',
      galaxy: 'https://hub',
    });

    const { result: hasEda } = renderHook(() => useHasEdaService(), { wrapper });
    const { result: hasHub } = renderHook(() => useHasHubService(), { wrapper });

    expect(hasEda.current).toBe(true);
    expect(hasHub.current).toBe(true);
  });
});
