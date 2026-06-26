/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useDeleteCredentials } from './useDeleteCredentials';

const server = setupServer(
  http.get('*/eda-credentials/*', () => HttpResponse.json({ id: 1, name: 'Cred', references: [] }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useDeleteCredentials', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  const createMockCredential = (overrides: Partial<EdaCredential> = {}): EdaCredential =>
    ({
      id: 1,
      name: 'Test Credential',
      description: 'A test credential',
      credential_type: { id: 1, name: 'Source Control', managed: true },
      managed: false,
      created_at: '2024-01-01T00:00:00Z',
      modified_at: '2024-01-01T00:00:00Z',
      ...overrides,
    }) as EdaCredential;

  it('should return a function', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteCredentials(onComplete), { wrapper });

    expect(typeof result.current).toBe('function');
  });

  it('should accept an array of credentials when called', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteCredentials(onComplete), { wrapper });

    const credentials = [createMockCredential({ id: 1, name: 'Cred A' })];

    await expect(result.current(credentials)).resolves.not.toThrow();
  });

  it('should handle multiple credentials', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteCredentials(onComplete), { wrapper });

    const credentials = [
      createMockCredential({ id: 1, name: 'Cred A' }),
      createMockCredential({ id: 2, name: 'Cred B' }),
      createMockCredential({ id: 3, name: 'Cred C' }),
    ];

    await expect(result.current(credentials)).resolves.not.toThrow();
  });

  it('should handle an empty array of credentials', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteCredentials(onComplete), { wrapper });

    await expect(result.current([])).resolves.not.toThrow();
  });

  it('should work without onComplete callback', () => {
    const { result } = renderHook(() => useDeleteCredentials(), { wrapper });

    expect(typeof result.current).toBe('function');
  });
});
