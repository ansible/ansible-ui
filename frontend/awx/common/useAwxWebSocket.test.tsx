import { render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadyState } from 'react-use-websocket';
import { WebSocketProvider, useAwxWebSocketSubscription } from './useAwxWebSocket';

const sendMessage = vi.fn();
let readyState = ReadyState.UNINSTANTIATED;
let lastJsonMessage: unknown = null;

vi.mock('react-use-websocket', async () => {
  const actual = await vi.importActual<typeof import('react-use-websocket')>('react-use-websocket');
  return {
    ...actual,
    default: () => ({
      sendMessage,
      sendJsonMessage: vi.fn(),
      lastMessage: null,
      lastJsonMessage,
      readyState,
      getWebSocket: () => null,
    }),
  };
});

vi.mock('@ansible/common-ui/crud/cookie', () => ({
  getCookie: () => 'csrf-token',
}));

function SubscriptionProbe({
  onMessage,
  fallback,
}: {
  onMessage: (message: unknown) => void;
  fallback?: () => () => void;
}) {
  useAwxWebSocketSubscription({ jobs: ['status_changed'] }, onMessage, fallback);
  return null;
}

describe('useAwxWebSocket', () => {
  beforeEach(() => {
    sendMessage.mockClear();
    readyState = ReadyState.UNINSTANTIATED;
    lastJsonMessage = null;
    process.env.AWX_WEBSOCKET_PREFIX = '/websocket/';
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('WebSocketProvider sends subscription payload when socket is open', async () => {
    readyState = ReadyState.OPEN;
    render(
      <WebSocketProvider>
        <SubscriptionProbe onMessage={vi.fn()} />
      </WebSocketProvider>
    );

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
    });
    const payload = JSON.parse(sendMessage.mock.calls.at(-1)?.[0] as string) as {
      xrftoken: string;
      groups: { jobs: string[] };
    };
    expect(payload.xrftoken).toBe('csrf-token');
    expect(payload.groups.jobs).toContain('status_changed');
  });

  it('useAwxWebSocketSubscription invokes onMessage for json messages', async () => {
    readyState = ReadyState.OPEN;
    const onMessage = vi.fn();
    lastJsonMessage = { group: 'jobs', message: 'update' };

    render(
      <WebSocketProvider>
        <SubscriptionProbe onMessage={onMessage} />
      </WebSocketProvider>
    );

    await waitFor(() => {
      expect(onMessage).toHaveBeenCalledWith({ group: 'jobs', message: 'update' });
    });
  });

  it('useAwxWebSocketSubscription calls fallback when not connected', () => {
    vi.useFakeTimers();
    readyState = ReadyState.UNINSTANTIATED;
    const stopFallback = vi.fn();
    const fallback = vi.fn(() => stopFallback);

    const { unmount } = render(
      <WebSocketProvider>
        <SubscriptionProbe onMessage={vi.fn()} fallback={fallback} />
      </WebSocketProvider>
    );

    vi.advanceTimersByTime(5000);
    expect(fallback).toHaveBeenCalled();

    unmount();
    expect(stopFallback).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('useAwxWebSocketSubscription returns websocket helpers', () => {
    readyState = ReadyState.OPEN;
    const { result } = renderHook(
      () => useAwxWebSocketSubscription({ jobs: ['status_changed'] }, vi.fn()),
      { wrapper: WebSocketProvider }
    );
    expect(result.current.sendMessage).toBeDefined();
    expect(result.current.readyState).toBe(ReadyState.OPEN);
  });

  it('cleans up subscriptions on unmount', async () => {
    readyState = ReadyState.OPEN;
    const { unmount } = render(
      <WebSocketProvider>
        <SubscriptionProbe onMessage={vi.fn()} />
      </WebSocketProvider>
    );

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
    });

    sendMessage.mockClear();
    unmount();

    render(
      <WebSocketProvider>
        <SubscriptionProbe onMessage={vi.fn()} />
      </WebSocketProvider>
    );

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
    });
  });
});
