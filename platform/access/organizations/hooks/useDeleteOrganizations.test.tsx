/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useDeleteOrganizations } from './useDeleteOrganizations';

const mockBulkConfirmation = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useBulkConfirmation: () => mockBulkConfirmation,
  };
});

describe('useDeleteOrganizations', () => {
  it('should return a function', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(typeof result.current).toBe('function');
  });

  it('should call bulk confirmation when invoked', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const mockOrganizations = [
      {
        id: 1,
        name: 'Test Org 1',
      },
      {
        id: 2,
        name: 'Test Org 2',
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.current(mockOrganizations as any);

    expect(mockBulkConfirmation).toHaveBeenCalled();
  });

  it('should configure bulk confirmation with correct properties', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const mockOrganizations = [
      {
        id: 1,
        name: 'Test Org 1',
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.current(mockOrganizations as any);

    expect(mockBulkConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        confirmText: expect.any(String),
        actionButtonText: expect.any(String),
        isDanger: true,
        onComplete: onComplete,
      })
    );
  });

  it('should pass organizations to bulk confirmation', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const mockOrganizations = [
      {
        id: 1,
        name: 'Test Org A',
      },
      {
        id: 2,
        name: 'Test Org B',
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.current(mockOrganizations as any);

    expect(mockBulkConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ name: 'Test Org A' }),
          expect.objectContaining({ name: 'Test Org B' }),
        ]),
      })
    );
  });

  it('should sort organizations by name', () => {
    mockBulkConfirmation.mockClear();
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteOrganizations(onComplete), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const mockOrganizations = [
      {
        id: 2,
        name: 'Zebra Org',
      },
      {
        id: 1,
        name: 'Apple Org',
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.current(mockOrganizations as any);

    const callArgs = mockBulkConfirmation.mock.calls[0][0];
    expect(callArgs.items[0].name).toBe('Apple Org');
    expect(callArgs.items[1].name).toBe('Zebra Org');
  });
});
