import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HubContentType } from './HubContentType';
import { useHubRoleMetadata } from './useHubRoleMetadata';

describe('useHubRoleMetadata', () => {
  it('returns namespace permissions metadata', () => {
    const { result } = renderHook(() => useHubRoleMetadata());

    expect(result.current.content_types[HubContentType.Namespace].displayName).toBe('Namespace');
    expect(
      result.current.content_types[HubContentType.Namespace].permissions['galaxy.view_namespace']
    ).toBe('View namespace');
  });
});
