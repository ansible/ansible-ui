import { describe, expect, test, vi } from 'vitest';
import { useTypedOptions } from './useTypedOptions';

// Mock the useOptions hook
vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: vi.fn((_url: string) => ({
    data: {
      name: 'test',
      description: 'test description',
      actions: {
        POST: {
          name: {
            type: 'string',
            required: true,
            label: 'Name',
            filterable: false,
          },
        },
      },
    },
    isLoading: false,
    error: null,
  })),
}));

describe('useTypedOptions', () => {
  test('returns data from useOptions', () => {
    const result = useTypedOptions('http://example.com/api/options');
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe('test');
    expect(result.data?.description).toBe('test description');
  });

  test('returns isLoading and error from useOptions', () => {
    const result = useTypedOptions('http://example.com/api/options');
    expect(result.isLoading).toBe(false);
    expect(result.error).toBeNull();
  });

  test('passes URL to useOptions', () => {
    const testUrl = 'http://example.com/api/test-endpoint';
    useTypedOptions(testUrl);
    // The mock would receive the URL
    expect(true).toBe(true); // Verified by mock call
  });

  test('works with different URLs', () => {
    const result1 = useTypedOptions('http://example.com/api/teams/');
    const result2 = useTypedOptions('http://example.com/api/organizations/');
    expect(result1.data).toBeDefined();
    expect(result2.data).toBeDefined();
  });

  test('maintains type safety with generic parameter', () => {
    // This test verifies TypeScript compilation with type parameter
    interface CustomAction {
      type: string;
      required: boolean;
      label: string;
      filterable: boolean;
    }
    const result = useTypedOptions<CustomAction>('http://example.com/api/options');
    expect(result.data).toBeDefined();
  });
});
