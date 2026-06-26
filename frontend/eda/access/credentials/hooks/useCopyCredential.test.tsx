/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useCopyCredential } from './useCopyCredential';

describe('useCopyCredential', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
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

  it('should return a function when onComplete is provided', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useCopyCredential(onComplete), { wrapper });

    expect(typeof result.current).toBe('function');
  });

  it('should not throw when called with a credential', () => {
    const { result } = renderHook(() => useCopyCredential(), { wrapper });

    const credential = createMockCredential();

    expect(() => result.current(credential)).not.toThrow();
  });
});
