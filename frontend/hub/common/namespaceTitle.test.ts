import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('namespaceTitle', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('when in Insights mode', () => {
    beforeEach(() => {
      process.env.IS_INSIGHTS = 'true';
    });

    it('should return company name when company is provided', async () => {
      const { namespaceTitle } = await import('./namespaceTitle');

      expect(namespaceTitle({ name: 'amazon', company: 'Amazon Web Services' })).toBe(
        'Amazon Web Services'
      );
    });

    it('should return namespace name when company is not provided', async () => {
      const { namespaceTitle } = await import('./namespaceTitle');

      expect(namespaceTitle({ name: 'amazon' })).toBe('amazon');
    });

    it('should return namespace name when company is empty string', async () => {
      const { namespaceTitle } = await import('./namespaceTitle');

      expect(namespaceTitle({ name: 'amazon', company: '' })).toBe('amazon');
    });
  });

  describe('when not in Insights mode', () => {
    beforeEach(() => {
      delete process.env.IS_INSIGHTS;
    });

    it('should return namespace name even when company is provided', async () => {
      const { namespaceTitle } = await import('./namespaceTitle');

      expect(namespaceTitle({ name: 'amazon', company: 'Amazon Web Services' })).toBe('amazon');
    });

    it('should return namespace name when company is not provided', async () => {
      const { namespaceTitle } = await import('./namespaceTitle');

      expect(namespaceTitle({ name: 'amazon' })).toBe('amazon');
    });
  });
});
