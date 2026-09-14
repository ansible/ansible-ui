import { afterEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from './randomUUID';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(value: string): boolean {
  return UUID_PATTERN.test(value);
}

describe('randomUUID', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a valid UUID v4', () => {
    expect(isValidUUID(randomUUID())).toBe(true);
  });

  it('should return unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => randomUUID()));
    expect(ids.size).toBe(100);
  });

  it('should use crypto.randomUUID when available', () => {
    const randomUUIDSpy = vi
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('550e8400-e29b-41d4-a716-446655440000');

    expect(randomUUID()).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(randomUUIDSpy).toHaveBeenCalledTimes(1);
  });

  it('should fall back to crypto.getRandomValues when crypto.randomUUID is unavailable', () => {
    const randomUUIDDescriptor = Object.getOwnPropertyDescriptor(crypto, 'randomUUID');
    Object.defineProperty(crypto, 'randomUUID', {
      configurable: true,
      value: undefined,
    });

    expect(isValidUUID(randomUUID())).toBe(true);

    if (randomUUIDDescriptor) {
      Object.defineProperty(crypto, 'randomUUID', randomUUIDDescriptor);
    }
  });
});
