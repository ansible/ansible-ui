import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import {
  GatewayServicesContext,
  GatewayServicesProvider,
  useGatewayService,
  useHasAwxService,
  useHasEdaService,
  useHasHubService,
} from './GatewayServices';

const server = setupServer(
  http.get('/api/', () =>
    HttpResponse.json({
      apis: {
        gateway: 'https://gateway.example',
        controller: 'https://controller.example/api/controller/',
        eda: 'https://eda.example/api/eda/',
        galaxy: 'https://hub.example/api/galaxy/',
      },
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockUseAwxConfigState = vi.hoisted(() => vi.fn(() => ({ serviceDown: false })));

vi.mock('@ansible/awx-ui/common/useAwxConfig', () => ({
  useAwxConfigState: mockUseAwxConfigState,
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

  test('useGatewayService should return undefined for unknown service types', () => {
    const wrapper = createWrapper({
      gateway: 'https://gateway',
      controller: 'https://controller',
    });

    const { result } = renderHook(() => useGatewayService(), { wrapper });

    expect(result.current).toBeUndefined();
  });

  test('useHasAwxService should hide AWX when serviceDown is true and ignoreServiceDown is false', () => {
    mockUseAwxConfigState.mockReturnValue({ serviceDown: true });
    const wrapper = createWrapper({
      gateway: 'https://gateway',
      controller: 'https://controller',
    });

    const { result } = renderHook(() => useHasAwxService(false), { wrapper });

    expect(result.current).toBeUndefined();
    mockUseAwxConfigState.mockReturnValue({ serviceDown: false });
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

describe('GatewayServicesProvider', () => {
  test('should expose service URLs after the gateway /api/ discovery call', async () => {
    function ServiceProbe() {
      const gateway = useGatewayService('gateway');
      const controller = useGatewayService('controller');
      const eda = useGatewayService('eda');
      const hub = useGatewayService('hub');
      return (
        <div>
          <span data-testid="gateway-url">{gateway}</span>
          <span data-testid="controller-url">{controller}</span>
          <span data-testid="eda-url">{eda}</span>
          <span data-testid="hub-url">{hub}</span>
        </div>
      );
    }

    render(
      <GatewayServicesProvider>
        <ServiceProbe />
      </GatewayServicesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('gateway-url')).toHaveTextContent('https://gateway.example');
    });
    expect(screen.getByTestId('controller-url')).toHaveTextContent(
      'https://controller.example/api/controller/'
    );
    expect(screen.getByTestId('eda-url')).toHaveTextContent('https://eda.example/api/eda/');
    expect(screen.getByTestId('hub-url')).toHaveTextContent('https://hub.example/api/galaxy/');
  });
});
