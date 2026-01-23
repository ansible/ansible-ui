import { describe, expect, it } from 'vitest';
import { AwxRoute } from '../insights/awx-stub';

describe('awx-stub', () => {
  it('should export AwxRoute as an empty object', () => {
    expect(AwxRoute).toEqual({});
  });

  it('should have AwxRoute defined', () => {
    expect(AwxRoute).toBeDefined();
  });
});
