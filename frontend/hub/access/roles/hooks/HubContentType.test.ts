import { describe, expect, it } from 'vitest';
import { HubContentType } from './HubContentType';

describe('HubContentType', () => {
  it('defines expected galaxy content type values', () => {
    expect(HubContentType.Namespace).toBe('galaxy.namespace');
    expect(HubContentType.Collection).toBe('galaxy.collection');
    expect(HubContentType.ExecutionEnvironment).toBe('galaxy.containernamespace');
    expect(HubContentType.Repository).toBe('galaxy.ansiblerepository');
    expect(HubContentType.System).toBe('null');
  });
});
