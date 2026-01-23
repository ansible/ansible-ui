import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('isInsightsMode', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return true when IS_INSIGHTS is boolean true', async () => {
    process.env.IS_INSIGHTS = true as unknown as string;
    const { isInsightsMode } = await import('./isInsights');

    expect(isInsightsMode()).toBe(true);
  });

  it('should return true when IS_INSIGHTS is string "true"', async () => {
    process.env.IS_INSIGHTS = 'true';
    const { isInsightsMode } = await import('./isInsights');

    expect(isInsightsMode()).toBe(true);
  });

  it('should return false when IS_INSIGHTS is undefined', async () => {
    delete process.env.IS_INSIGHTS;
    const { isInsightsMode } = await import('./isInsights');

    expect(isInsightsMode()).toBe(false);
  });

  it('should return false when IS_INSIGHTS is false', async () => {
    process.env.IS_INSIGHTS = false as unknown as string;
    const { isInsightsMode } = await import('./isInsights');

    expect(isInsightsMode()).toBe(false);
  });

  it('should return false when IS_INSIGHTS is string "false"', async () => {
    process.env.IS_INSIGHTS = 'false';
    const { isInsightsMode } = await import('./isInsights');

    expect(isInsightsMode()).toBe(false);
  });
});
