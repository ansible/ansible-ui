/* eslint-disable i18next/no-literal-string */
import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useCopyCredential } from './useCopyCredential';
import { BrowserRouter } from 'react-router-dom';

const server = setupServer();

describe('useCopyCredential', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  const createMockCredential = (): EdaCredential =>
    ({
      id: 1,
      name: 'Test Credential',
      description: 'A test credential',
      credential_type: { id: 1, name: 'Source Control', managed: true },
      managed: false,
      created_at: '2024-01-01T00:00:00Z',
      modified_at: '2024-01-01T00:00:00Z',
    }) as unknown as EdaCredential;

  it('should return a function', () => {
    const { result } = renderHook(() => useCopyCredential(), { wrapper });

    expect(typeof result.current).toBe('function');
  });

  it('should call onComplete after successful copy', async () => {
    const onComplete = vi.fn();
    server.use(
      http.post('*/eda-credentials/1/copy/', () => {
        return HttpResponse.json({ id: 2, name: 'Test Credential copy' });
      })
    );

    const { result } = renderHook(() => useCopyCredential(onComplete), { wrapper });
    const credential = createMockCredential();

    act(() => {
      result.current(credential);
    });

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should not throw when called with a credential', () => {
    server.use(
      http.post('*/eda-credentials/1/copy/', () => {
        return HttpResponse.json({ id: 2, name: 'Test Credential copy' });
      })
    );

    const { result } = renderHook(() => useCopyCredential(), { wrapper });
    const credential = createMockCredential();

    expect(() => result.current(credential)).not.toThrow();
  });
});
